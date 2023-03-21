import { botConfig } from 'config'
import type { GroupMessageEvent } from 'oicq'
import { Configuration, OpenAIApi } from 'openai'

import { commandRegistry } from '~/registries/command'
import { mentionRegistry } from '~/registries/mention'

export const register = () => {
  const configuration = new Configuration({
    apiKey: botConfig.chatgpt.token,
  })
  const openai = new OpenAIApi(configuration)

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
    const reply = await openai.createCompletion({
      model: 'gpt-4-0314',

      temperature: 0.6,
    })

    const ans = reply.data.choices[0].text

    // if (!conversationId && reply.conversationId) {
    //   userId2ConversationIdMap.set(userId, reply.conversationId)
    //   conversationId2MessageIdMap.set(reply.conversationId, reply.id)
    // }
    if (ans) event.reply(ans, true)
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
