import rmd from 'remove-markdown'

import type { NoteModel, RequestError } from '@mx-space/api-client'

import { MessageType, plugins } from '~/plugin-manager'

import { apiClient } from './api-client'
import { fetchHitokoto } from './api/hitokoto'
import { MxContext } from './types'

export const listenMessage = async (ctx: MxContext) => {
  plugins.message.register(
    MessageType.command,
    async (event, message, prevMessage) => {
      switch (message.type) {
        case 'text': {
          const fullCommand = message.text.slice(1)
          const commandSplit = fullCommand.split(' ')
          const commandName = commandSplit[0]
          const afterArgs = commandSplit.slice(1)
          const caller = commandMap[commandName]
          const {
            aggregationData: {
              seo: { title },
            },
          } = ctx
          const prefix = `来自${title ? `「${title}」` : ' Mix Space '}的 `
          if (caller) {
            return prefix + (await caller(ctx, afterArgs))
          }
        }
      }

      return prevMessage
    },
  )
}

const commandMap: Record<
  string,
  (ctx: MxContext, args: string[]) => string | Promise<string>
> = {
  rss: async (ctx) => {
    const data = await apiClient.aggregate.getTop(5)

    const aggregate = ctx.aggregationData
    const {
      url: { webUrl },
    } = aggregate
    const posts = data.posts
      .map(
        (post) =>
          `${post.title}\n${webUrl}/posts/${post.category.slug}/${post.slug}`,
      )
      .join('\n')
    const notes = data.notes
      .map((note) => `${note.title}\n${webUrl}/notes/${note.nid}`)
      .join('\n')
    return 'RSS 列表：' + '\n' + `博文：\n${posts}\n\n生活记录：\n${notes}`
  },
  mx_stat: async () => {
    const data = await apiClient.aggregate.getStat()

    const {
      callTime,
      posts,
      notes,
      linkApply,
      recently,
      says,
      todayIpAccessCount,
      todayMaxOnline,
      todayOnlineTotal,
      unreadComments,
      comments,
      links,
      online,
    } = data
    return (
      '状态信息：' +
      '\n\n' +
      `当前有文章 ${posts} 篇，生活记录 ${notes} 篇，评论 ${comments} 条，友链 ${links} 条，说说 ${says} 条，速记 ${recently} 条。` +
      '\n' +
      `未读评论 ${unreadComments} 条，友链申请 ${linkApply} 条。` +
      '\n' +
      `今日访问 ${todayIpAccessCount} 次，最高在线 ${todayMaxOnline} 人，总计在线 ${todayOnlineTotal} 人。` +
      '\n' +
      `调用次数 ${callTime} 次，当前在线 ${online} 人。`
    )
  },

  mx_version: async () => {
    const data = await apiClient.proxy.info.get()
    return `版本信息：\n\n${JSON.stringify(data, null, 2)}`
  },

  mx_health: async (ctx) => {
    const socketConnected = ctx.socket.connected
    const data = ctx.aggregationData
    return (
      `健康检查：\n\n` +
      `Socket 连接状态：${socketConnected ? '正常' : '异常'}` +
      `\n\n` +
      `聚合数据获取：${JSON.stringify(data, null, 2)}`
    )
  },

  mx_refresh_data: async (ctx) => {
    await ctx.refreshData()
    return '提示：\n\n刷新成功'
  },

  mx_note: async (ctx, args) => {
    const [_nid] = args
    const nid = parseInt(_nid, 10)
    if (!nid) {
      return '日记：\n\n请指定生活记录 ID'
    }
    const {
      aggregationData: {
        url: { webUrl },
      },
    } = ctx
    try {
      const _data = await apiClient.note.getNoteById(
        nid as any,
        undefined,
        true,
      )
      // TODO remmove this
      // @ts-ignore
      const data: NoteModel = _data.data || _data

      if (data.password || data.hide) {
        return '日记：\n\n该日记已被隐藏或者已加密'
      }
      return `日记：\n\n${data.title}\n\n${rmd(
        data.text,
      )}\n\n前往阅读：${webUrl}/notes/${data.nid}`
      // @ts-ignore
    } catch (err: RequestError) {
      return `日记获取错误：\n\n${err.message}`
    }
  },

  hitokoto: async () => {
    const { hitokoto } = await fetchHitokoto()
    return `一言：\n\n${hitokoto}`
  },
}
