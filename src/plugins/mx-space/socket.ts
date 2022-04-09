import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import { Sendable } from 'oicq'
import rmd from 'remove-markdown'
import { io } from 'socket.io-client'

import {
  CommentModel,
  LinkModel,
  NoteModel,
  PostModel,
} from '@mx-space/api-client'

import { client } from '~/client'
import { MxSocketEventTypes } from '~/plugins/mx-space/types/mx-socket-types'

import { botConfig } from '../../../config'
import { createNamespaceLogger } from '../../utils/logger'
import { apiClient } from './api-client'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'

const logger = createNamespaceLogger('mx-socket')
export const mxSocket = io(botConfig.mxSpace?.gateway, {
  transports: ['websocket'],
  timeout: 10000,
  forceNew: true,
  query: {
    token: botConfig.mxSpace.token,
  },

  autoConnect: false,
})

mxSocket.io.on('error', () => {
  logger.error('Socket 连接异常')
})
mxSocket.io.on('reconnect', () => {
  logger.info('Socket 重连成功')
})
mxSocket.io.on('reconnect_attempt', () => {
  logger.info('Socket 重连中')
})
mxSocket.io.on('reconnect_failed', () => {
  logger.info('Socket 重连失败')
})

mxSocket.on('disconnect', () => {
  const tryReconnect = () => {
    if (mxSocket.connected === false) {
      mxSocket.io.connect()
    } else {
      timer = clearInterval(timer)
    }
  }
  let timer: any = setInterval(tryReconnect, 2000)
})

mxSocket.on(
  'message',
  (payload: string | Record<'type' | 'data' | 'code', any>) => {
    if (typeof payload !== 'string') {
      return handleEvent(
        payload.type,
        camelcaseKeys(payload.data, { deep: true }),
        payload.code,
      )
    }
    const { data, type, code } = JSON.parse(payload) as {
      data: any
      type: MxSocketEventTypes
      code?: number
    }
    handleEvent(type, camelcaseKeys(data, { deep: true }), code)
  },
)

const handleEvent = async (
  type: MxSocketEventTypes,
  payload: any,
  code?: number,
) => {
  logger.debug(type, payload)

  let user = userStore.user

  if (!user) {
    user = await userStore.fetchUser()
    userStore.setUser(user)
  }

  const {
    url: { webUrl },
  } = aggregateStore.aggregate

  const sendToGuild = async (message: Sendable) => {
    const { watchGroupIds } = botConfig.mxSpace

    return await Promise.all(
      watchGroupIds.map((id) => {
        return client.sendGroupMsg(id, message)
      }),
    )
  }

  switch (type) {
    case MxSocketEventTypes.POST_CREATE: {
      const { title, text, category, id, slug, summary } = payload as PostModel

      if (!category) {
        logger.error(`category not found, post id: ${id}`)
        return
      }
      const simplePreview = rmd(text).slice(0, 200)
      const message = `${
        user.name
      } 发布了新文章: ${title}\n\n${simplePreview}\n\n${
        summary ? `${summary}\n\n` : ''
      }前往阅读: ${webUrl}/posts/${category.slug}/${slug}`
      await sendToGuild(message)

      return
    }

    case MxSocketEventTypes.NOTE_CREATE: {
      const { title, text, nid, mood, weather } = payload as NoteModel
      const simplePreview = rmd(text).slice(0, 200)

      const status = [mood ? `心情: ${mood}` : '']
        .concat(weather ? `天气: ${weather}` : '')
        .filter(Boolean)
        .join('\t')
      const message = `${user.name} 发布了新生活观察日记: ${title}\n\n${
        status ? `${status}\n` : ''
      }${simplePreview}\n\n前往阅读: ${webUrl}/notes/${nid}`
      await sendToGuild(message)

      return
    }

    case MxSocketEventTypes.LINK_APPLY: {
      const { avatar, name, url, description } = payload as LinkModel
      const avatarBase64: Buffer | string = await axios
        .get(avatar, { responseType: 'arraybuffer', timeout: 4000 })
        .then((data) => data.data)
        .then((arr) => {
          return Buffer.from(arr)
        })
        .catch((err) => {
          return ''
        })

      const message =
        `有新的友链申请了耶！\n` + `${name}\n${url}\n\n` + `${description}`
      const sendable: Sendable = []

      if (avatarBase64) {
        sendable.push({
          type: 'image',
          file: avatarBase64,
        })
      }

      sendable.push({
        type: 'text',
        text: avatarBase64 ? `\n${message}` : message,
      })
      await sendToGuild(sendable)
      return
    }

    case MxSocketEventTypes.COMMENT_CREATE: {
      const { author, key, text, refType, parent } = payload as CommentModel
      const ref = payload.ref?.id || payload.ref
      let refModel: any

      switch (refType) {
        case 'Post': {
          refModel = await apiClient.post.getPost(ref)
          break
        }
        case 'Note': {
          refModel = await apiClient.note.getNoteById(ref)
          break
        }
        case 'Page': {
          refModel = await apiClient.page.getById(ref)
          break
        }
      }

      if (!refModel) {
        return
      }

      const message = `${author} 在「${refModel.title}」回复了评论: ${text}\n`

      sendToGuild(message)
    }
  }
}
