import { MessageType, plugins } from '~/plugin-manager'

import { apiClient } from './api-client'
import { fetchHitokoto } from './api/hitokoto'
import { aggregateStore } from './store/aggregate'

export const listenMessage = async () => {
  plugins.message.register(
    MessageType.command,
    async (event, message, prevMessage) => {
      switch (message.type) {
        case 'text': {
          const caller = commandMap[message.text.slice(1)]

          if (caller) {
            return await caller()
          }
        }
      }

      return prevMessage
    },
  )
}

const commandMap = {
  rss: async () => {
    const data = await apiClient.aggregate.getTop(5)

    const { aggregate } = aggregateStore
    if (!aggregate) {
      return
    }
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
    return (
      '来自 Mx Space 的 RSS 列表：' +
      '\n' +
      `博文：\n${posts}\n\n生活记录：\n${notes}`
    )
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
      '来自 Mx Space 的状态信息：' +
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
    const data = await apiClient.proxy.get()
    return JSON.stringify(data, null, 2)
  },

  hitokoto: async () => {
    const { hitokoto } = await fetchHitokoto()
    return hitokoto
  },
}
