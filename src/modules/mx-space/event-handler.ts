import { botConfig } from 'config'
import dayjs from 'dayjs'
import type { Client, Sendable } from 'icqq'
import rmd from 'remove-markdown'
import type {
  CommentModel,
  LinkModel,
  NoteModel,
  PageModel,
  PostModel,
  RecentlyModel,
  SayModel,
} from '@mx-space/api-client'
import { LinkState } from '@mx-space/api-client'
import { isDev } from '~/constants/env'
import { createNamespaceLogger } from '~/utils/logger'
import { getShortDateTime, relativeTimeFromNow } from '~/utils/time'
import { apiClient } from './api-client'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'
import {
  MxSocketEventTypes,
  MxSystemEventBusEvents,
} from './types/mx-socket-types'
import { fetchImageBuffer } from './utils/fetch-image'

const logger = createNamespaceLogger('mx-event')
export const handleEvent =
  (client: Client) =>
  async (
    type: MxSocketEventTypes | MxSystemEventBusEvents,
    payload: any,
    code?: number,
  ) => {
    logger.debug(type, payload)

    const user = userStore.user!

    const {
      url: { webUrl },
      seo: { title: siteTitle },
    } = aggregateStore.aggregate!

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
        // case MxSocketEventTypes.POST_UPDATE:
        const isNew = type === MxSocketEventTypes.POST_CREATE
        const publishDescription = isNew ? '发布了新文章' : '更新了文章'
        const { title, text, category, id, slug, summary } =
          payload as PostModel

        if (!category) {
          logger.error(`category not found, post id: ${id}`)
          return
        }
        const simplePreview = getSimplePreview(text)
        const message = `${
          user.name
        } ${publishDescription}: ${title}\n\n${simplePreview}\n\n${
          summary ? `${summary}\n\n` : ''
        }前往阅读：${webUrl}/posts/${category.slug}/${slug}`
        await sendToGuild(message)

        return
      }

      case MxSocketEventTypes.NOTE_CREATE: {
        // case MxSocketEventTypes.NOTE_UPDATE: {
        const isNew = type === MxSocketEventTypes.NOTE_CREATE
        const publishDescription = isNew ? '发布了新生活观察日记' : '更新了日记'
        const { title, text, nid, mood, weather, images, hide, password } =
          payload as NoteModel
        const isSecret = checkNoteIsSecret(payload as NoteModel)

        if (hide || password || isSecret) {
          return
        }
        const simplePreview = getSimplePreview(text)

        const status = [mood ? `心情: ${mood}` : '']
          .concat(weather ? `天气: ${weather}` : '')
          .filter(Boolean)
          .join('\t')
        const message = `${user.name} ${publishDescription}: ${title}\n${
          status ? `\n${status}\n\n` : '\n'
        }${simplePreview}\n\n前往阅读：${webUrl}/notes/${nid}`
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
        const { author, text, refType, parent, id, isWhispers } =
          payload as CommentModel
        if (isWhispers) {
          await sendToGuild(`「${siteTitle}」嘘，有人说了一句悄悄话。`)
          return
        }

        const parentIsWhispers = (() => {
          const walk: (parent: any) => boolean = (parent) => {
            if (!parent || typeof parent == 'string') {
              return false
            }
            return parent.isWhispers || walk(parent?.parent)
          }

          return walk(parent)
        })()
        if (parentIsWhispers) {
          return
        }

        const refId = payload.ref?.id || payload.ref?._id || payload.ref
        let refModel: PostModel | NoteModel | PageModel | null = null

        switch (refType) {
          case 'Post': {
            refModel = await apiClient.post.getPost(refId)
            break
          }
          case 'Note': {
            refModel = await apiClient.note.getNoteById(refId as string)

            break
          }
          case 'Page': {
            refModel = await apiClient.page.getById(refId)
            break
          }
        }

        if (!refModel) {
          return
        }
        const isMaster = author === user.name || author === user.username
        let message: string
        if (isMaster && !parent) {
          message = `${author} 在「${
            refModel.title
          }」发表之后的 ${relativeTimeFromNow(refModel.created)}又说：${text}`
        } else {
          message = `${author} 在「${refModel.title}」发表了评论：${text}`
        }

        const uri = (() => {
          switch (refType) {
            case 'Post': {
              return `/posts/${(refModel as PostModel).category.slug}/${
                (refModel as PostModel).slug
              }`
            }
            case 'Note': {
              return `/notes/${(refModel as NoteModel).nid}`
            }
            case 'Page': {
              return `/${(refModel as PageModel).slug}`
            }
          }
        })()

        if (uri) {
          message += `\n\n查看评论：${webUrl}${uri}#comments-${id}`
        }

        sendToGuild(message)
        return
      }

      case MxSocketEventTypes.PAGE_UPDATED: {
        const { title, slug } = payload as PageModel
        const message = `${user.name} 更新了页面「${title}」\n\n前往查看：${webUrl}/${slug}`
        await sendToGuild(message)
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

      case MxSystemEventBusEvents.SystemException: {
        const { message, stack } = payload as Error
        const messageWithStack = `来自 Mix Space 的系统异常：${getShortDateTime(
          new Date(),
        )}\n${message}\n\n${stack}`
        await sendToGuild(messageWithStack)
        return
      }
      default: {
        if (isDev) {
          console.log(payload)
        }
      }
    }
  }

const getSimplePreview = (text: string) => {
  const _text = rmd(text) as string
  return _text.length > 200 ? `${_text.slice(0, 200)}...` : _text
}

function checkNoteIsSecret(note: NoteModel) {
  if (!note.secret) {
    return false
  }
  const isSecret = dayjs(note.secret).isAfter(new Date())

  return isSecret
}
