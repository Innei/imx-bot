import { cgpt } from 'chatgpt-lib'
import { botConfig } from 'config'

import { commandRegistry } from '~/registries/command'

export const register = () => {
  const chatbot = new cgpt.ChatGPT({
    SessionToken: botConfig.chatgpt.token,
  })

  commandRegistry.register('ask', async (event) => {
    const plainTextMessage = event.message.reduce((acc, cur) => {
      if (cur.type === 'text') {
        acc += cur.text
      }
      return acc
    }, '')

    const reply = await chatbot.ask(plainTextMessage)
    event.reply(reply, true)
  })
}
