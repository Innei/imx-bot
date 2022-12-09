import cgpt from 'chatgpt-lib'
import { botConfig } from 'config'
import type { GroupMessageEvent } from 'oicq'

import { commandRegistry } from '~/registries/command'
import { mentionRegistry } from '~/registries/mention'

export const register = () => {
  const chatbot = new cgpt.ChatGPT({
    SessionToken: botConfig.chatgpt.token,
  })
  async function handle(event: GroupMessageEvent) {
    const plainTextMessage = event.message.reduce((acc, cur) => {
      if (cur.type === 'text') {
        acc += cur.text
      }
      return acc
    }, '')

    consola.debug(`ask: ${plainTextMessage}`)
    const reply = await chatbot.ask(plainTextMessage)
    event.reply(reply, true)
  }
  commandRegistry.register('ask', handle)
  commandRegistry.register('chat', (event: GroupMessageEvent) => {
    if (event.message.length === 1 && event.message[0].type === 'text') {
      const isReset = event.message[0].text.trim() === 'reset'
      if (isReset) {
        chatbot.resetThread()
        event.reply('已重置对话')
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
