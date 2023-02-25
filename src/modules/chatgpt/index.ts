import 'isomorphic-fetch'

import { ChatGPTAPI } from 'chatgpt'
import { botConfig } from 'config'
import type { GroupMessageEvent } from 'oicq'

import { commandRegistry } from '~/registries/command'
import { mentionRegistry } from '~/registries/mention'

export const register = () => {
  const chatbot = new ChatGPTAPI({
    apiKey: botConfig.chatgpt.token,
  })

  const userId2ConversationIdMap = new Map<number, string>()
  const conversationId2MessageIdMap = new Map<string, string>()

  async function handle(event: GroupMessageEvent) {
    const userId = event.sender.user_id
    const conversationId = userId2ConversationIdMap.get(userId)
    const parentMessageId = conversationId
      ? conversationId2MessageIdMap.get(conversationId)
      : undefined

    const plainTextMessage = event.message.reduce((acc, cur) => {
      if (cur.type === 'text') {
        acc += cur.text
      }
      return acc
    }, '')

    consola.debug(`Q: ${plainTextMessage}`)
    const reply = await chatbot.sendMessage(plainTextMessage, {
      conversationId,
      parentMessageId,
      timeoutMs: 10_000,
    })

    if (!conversationId && reply.conversationId) {
      userId2ConversationIdMap.set(userId, reply.conversationId)
      conversationId2MessageIdMap.set(reply.conversationId, reply.id)
    }
    event.reply(reply.text, true)
  }
  commandRegistry.register('ask', handle)
  commandRegistry.register('chat', (event: GroupMessageEvent) => {
    if (event.message.length === 1 && event.message[0].type === 'text') {
      const isReset = event.message[0].text.trim() === 'reset'
      const userId = event.sender.user_id
      if (isReset) {
        const conversationId = userId2ConversationIdMap.get(userId)
        userId2ConversationIdMap.delete(userId)
        conversationId && conversationId2MessageIdMap.delete(conversationId)
        event.reply('ChatGPT: 已重置上下文', true)
        return
      }
    }

    handle(event)
  })

  mentionRegistry.register(async (event, abort) => {
    await handle(event)
    abort()
  })
}
