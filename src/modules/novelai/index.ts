import type { Client } from 'oicq'

import { MessageType, plugins } from '~/plugin-manager'

import { getApiImage } from './api'

const command2Shape: Record<string, 'Portrait' | 'Landscape' | 'Square'> = {
  ai_sfw_l: 'Landscape',
  ai_sfw_p: 'Portrait',
  ai_sfw_s: 'Square',
}

class NovelAiStatic {
  async setup() {
    plugins.message.register(
      MessageType.command,
      async (event, message, prevMessage) => {
        if (!('commandName' in message)) {
          return prevMessage
        }

        if (
          message.commandName != 'ai_sfw_l' &&
          message.commandName != 'ai_sfw_p' &&
          message.commandName != 'ai_sfw_s'
        ) {
          return prevMessage
        }

        const args = message.commandArgs
        if (!args) {
          return prevMessage
        }

        // TODO
        const bufferOrText = await getApiImage({
          tagText: args,
          shape: command2Shape[message.commandName] || 'Portrait',
        })

        if (typeof bufferOrText == 'string') {
          return bufferOrText || '出错了'
        }

        return {
          type: 'image',
          file: Buffer.from(bufferOrText),
        }
      },
    )
  }
}

const novelAi = new NovelAiStatic()

export const register = (ctx: Client) => {
  novelAi.setup()
  return novelAi
}
