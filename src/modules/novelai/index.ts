import { botConfig } from 'config'
import type { Client, GroupMessageEvent } from 'oicq'

import { isDev } from '~/constants/env'
import { MessageType, plugins } from '~/plugin-manager'

import { getApiImage } from './api'

const command2Shape: Record<string, 'Portrait' | 'Landscape' | 'Square'> = {
  ai_sfw_l: 'Landscape',
  ai_sfw_p: 'Portrait',
  ai_sfw_s: 'Square',
}

class NovelAiStatic {
  private enabled = isDev

  /**
   * 炼金任务
   */
  private hasLongTask = false

  async setup() {
    plugins.message.register(
      MessageType.command,
      async (event, message, prevMessage) => {
        if (!('commandName' in message)) {
          return prevMessage
        }

        const allowedCommandNames = ['ai_sfw_l', 'ai_sfw_p', 'ai_sfw_s']

        if (!message.commandName) {
          return prevMessage
        }

        const gEvent = event as GroupMessageEvent
        const isOwner = gEvent.sender.user_id === botConfig.ownerId
        if (isOwner) {
          if (message.commandName === 'ai_sfw_toggle') {
            this.enabled = !this.enabled
            return `AI 绘图：已${this.enabled ? '开启' : '关闭'}`
          }
        }

        if (message.commandName === 'ai_sfw_status') {
          return `AI 绘图：${this.enabled ? '开启' : '关闭'}`
        }

        if (!this.enabled) {
          return prevMessage
        }

        if (!allowedCommandNames.includes(message.commandName)) {
          return prevMessage
        }

        const args = message.commandArgs
        if (!args) {
          return prevMessage
        }

        if (this.hasLongTask) {
          return 'AI 绘图：当前正在炼金，请稍后再试'
        }

        // /ai_sfw_l masterpiece,best quality,extremely detailed CG unity 8k wallpaper, (((loli))), looking at viewer, white short hair, solo, white knee high, white socks, dynamic_angle, white jk, (cute), ((kindergarten)), red eyes, (hoodie), ((:3)),(lift by self),(underwear),((cute)),sea,genshin impact,shark
        // seed=68846426&scale=22&count=10

        const [tagText, params = ''] = args.split('\n')
        const paramsObject = new URLSearchParams(params)
        const count = paramsObject.get('count') || 1

        if (count == 1) event.reply('在画了在画了...', true)
        for (let i = 0; i < Math.max(count ? +count || 1 : 1, 5); i++) {
          if (count > 1) {
            this.hasLongTask = true
            event.reply(`开始炼金，第 ${i} 张/共 ${count} 张`)
          }

          const bufferOrText = await getApiImage({
            tagText,
            shape: command2Shape[message.commandName] || 'Portrait',
            seed: paramsObject.get('seed') || undefined,
            scale: paramsObject.get('scale') || undefined,
          })

          if (typeof bufferOrText == 'string') {
            this.hasLongTask = false
            return bufferOrText || '出错了'
          }

          if (this.enabled) {
            await event.reply(
              [
                {
                  type: 'image',
                  file: Buffer.from(bufferOrText.buffer),
                },
                {
                  type: 'text',
                  text: `\ntags: ${bufferOrText.tags}\n\nseed: ${
                    bufferOrText.seed
                  }, scale: ${paramsObject.get('scale') || `11.0`}`,
                },
              ],
              true,
            )
          }
        }

        this.hasLongTask = false

        return prevMessage
      },
    )
  }
}

const novelAi = new NovelAiStatic()

export const register = (ctx: Client) => {
  novelAi.setup()
  return novelAi
}
