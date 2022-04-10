import camelcaseKeys from 'camelcase-keys'
import { Client, Sendable } from 'oicq'
import rmd from 'remove-markdown'
import { io } from 'socket.io-client'

import {
  CommentModel,
  LinkModel,
  LinkState,
  NoteModel,
  PageModel,
  PostModel,
  RecentlyModel,
  SayModel,
} from '@mx-space/api-client'

import { MxSocketEventTypes } from '~/plugins/mx-space/types/mx-socket-types'

import { botConfig } from '../../../config'
import { createNamespaceLogger } from '../../utils/logger'
import { apiClient } from './api-client'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'
import { fetchImageBuffer } from './utils/fetch-image'

// eslint-disable-next-line import/no-default-export
export default (client: Client) => {
  const logger = createNamespaceLogger('mx-socket')
  const mxSocket = io(botConfig.mxSpace?.gateway, {
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

    const user = userStore.user

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
      case MxSocketEventTypes.POST_CREATE:
      case MxSocketEventTypes.POST_UPDATE: {
        const isNew = type === MxSocketEventTypes.POST_CREATE
        const publishDescription = isNew ? '发布了新文章' : '更新了文章'
        const { title, text, category, id, slug, summary } =
          payload as PostModel

        if (!category) {
          logger.error(`category not found, post id: ${id}`)
          return
        }
        const simplePreview = rmd(text).slice(0, 200)
        const message = `${
          user.name
        } ${publishDescription}: ${title}\n\n${simplePreview}\n\n${
          summary ? `${summary}\n\n` : ''
        }前往阅读: ${webUrl}/posts/${category.slug}/${slug}`
        await sendToGuild(message)

        return
      }

      case MxSocketEventTypes.NOTE_CREATE:
      case MxSocketEventTypes.NOTE_UPDATE: {
        const isNew = type === MxSocketEventTypes.NOTE_CREATE
        const publishDescription = isNew ? '发布了新生活观察日记' : '更新了日记'
        const { title, text, nid, mood, weather, images } = payload as NoteModel
        const simplePreview = rmd(text).slice(0, 200)

        const status = [mood ? `心情: ${mood}` : '']
          .concat(weather ? `天气: ${weather}` : '')
          .filter(Boolean)
          .join('\t')
        const message = `${user.name} ${publishDescription}: ${title}\n${
          status ? `${status}\n` : '\n'
        }${simplePreview}\n\n前往阅读: ${webUrl}/notes/${nid}`
        await sendToGuild(message)

        if (Array.isArray(images) && images.length > 0) {
          const imageBuffer = await fetchImageBuffer(images[0].src)
          await sendToGuild({
            type: 'image',
            file: imageBuffer,
          })
        }

        return
      }

      case MxSocketEventTypes.LINK_APPLY: {
        const { avatar, name, url, description, state } = payload as LinkModel
        if (state !== LinkState.Audit) {
          return
        }
        const avatarBuffer: Buffer | string = await fetchImageBuffer(avatar)

        const message =
          `有新的友链申请了耶！\n` + `${name}\n${url}\n\n` + `${description}`
        const sendable: Sendable = []

        if (avatarBuffer) {
          sendable.push({
            type: 'image',
            file: avatarBuffer,
          })
        }

        sendable.push({
          type: 'text',
          text: avatarBuffer ? `\n${message}` : message,
        })
        await sendToGuild(sendable)
        return
      }

      case MxSocketEventTypes.COMMENT_CREATE: {
        const { author, key, text, refType, parent } = payload as CommentModel
        const ref = payload.ref?.id || payload.ref
        let refModel: PostModel | NoteModel | PageModel

        switch (refType) {
          case 'Post': {
            refModel = await apiClient.post.getPost(ref)
            break
          }
          case 'Note': {
            refModel = await apiClient.note
              .getNoteById(ref)
              .then((data) => data.data)
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
        return
      }

      case MxSocketEventTypes.SAY_CREATE: {
        const { author, source, text } = payload as SayModel

        const message =
          `${user.name} 发布一条说说：\n` +
          `${text}\n${source || author ? `来自: ${source || author}` : ''}`
        await sendToGuild(message)

        return
      }
      case MxSocketEventTypes.RECENTLY_CREATE: {
        const { content } = payload as RecentlyModel

        const message = `${user.name} 发布一条动态说：\n${content}`
        await sendToGuild(message)

        return
      }
    }
  }

  return mxSocket
}
