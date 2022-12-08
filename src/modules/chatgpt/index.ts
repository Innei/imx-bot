import cgpt from 'chatgpt-lib'
import { botConfig } from 'config'
import type { GroupMessageEvent } from 'oicq'

import { commandRegistry } from '~/registries/command'

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
  commandRegistry.register('chat', handle)
}
