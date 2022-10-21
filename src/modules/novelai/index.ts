/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios'
import { botConfig } from 'config'
import { appendFile, readFile } from 'fs/promises'
import { sample } from 'lodash'
import type {
  Client,
  GroupMessageEvent,
  ImageElem,
  MessageEvent,
  TextElem,
} from 'oicq'
import path from 'path'

import { userAgent } from '~/constants/env'
import { MessageType, plugins } from '~/plugin-manager'

import { aiRequestQueue, getApiImage, getImage2Image } from './api'

const command2Shape: Record<string, 'Portrait' | 'Landscape' | 'Square'> = {
  ai_sfw_l: 'Landscape',
  ai_sfw_p: 'Portrait',
  ai_sfw_s: 'Square',
}

class NovelAiStatic {
  private enabled = true

  /**
   * 炼金任务
   */
  private hasLongTask = false

  private formulaFilePath = path.join(String(process.cwd()), 'formula.txt')

  // 配方格式： 备注|配方
  // 如： favor|8k wallpaper,loli,genshin
  private async readFormula() {
    const content = await readFile(this.formulaFilePath, {
      encoding: 'utf-8',
    }).catch(() => {})

    if (!content) {
      return []
    }

    return content
      .split('\n')
      .map((line) => {
        return line.split('|')
      })
      .filter((line) => line[0] && line[1])
  }

  private async saveFormula(
    message: TextElem,
    event: GroupMessageEvent,
    abort: () => void,
  ) {
    if (!event.source) {
      return '无法获取来源信息'
    }
    const quotedMessage = event.source.message
    if (!quotedMessage) {
      return '引用消息为空'
    }

    const tagsText = quotedMessage
      .toString()
      .replace('[图片] tags:', '')
      .split('seed: ')[0]
    const remark = message.commandArgs

    await appendFile(
      this.formulaFilePath,
      `${remark || 'formula'}|${`${tagsText}\n`}`,
      {
        encoding: 'utf-8',
      },
    )

    await event.reply('保存成功', true)

    abort()
  }

  private async useFormula(
    message: TextElem,
    event: MessageEvent,
    abort: () => void,
  ) {
    const formulaIndex = parseInt(message.commandArgs?.trim() || '0')
    if (Number.isNaN(formulaIndex)) {
      return '无效的配方编号'
    }

    const afterIndex =
      message.commandArgs?.slice(String(formulaIndex).length) || ''
    const postfixAiArgs = afterIndex.replace(/^&/, '')
    const matrix = await this.readFormula()

    const formula = matrix[formulaIndex - 1]

    const [, nextLineArgs = postfixAiArgs] =
      message.commandArgs?.split('\n') || []

    if (formula) {
      event.reply(`使用配方：${formula.toString()}`)
      return await this.draw(
        {
          ...message,
          commandArgs: `${formula[1]}\n${nextLineArgs}`,
        },
        event,
        abort,
      )
    }

    return '无效的配方'
  }

  private getDrawMessage() {
    if (aiRequestQueue.waitingcount > 0) {
      return `AI 绘图：排队中，前方还有 ${aiRequestQueue.waitingcount} 个请求`
    }
    return sample(['在画了在画了...', '少女鉴赏中...'])!
  }
  private async draw(
    message: TextElem,
    event: MessageEvent,
    abort: () => void,
  ) {
    const args = message.commandArgs
    if (!args) {
      return abort()
    }

    if (this.hasLongTask) {
      return 'AI 绘图：当前正在炼金，请稍后再试'
    }

    // /ai_sfw_l masterpiece,best quality,extremely detailed CG unity 8k wallpaper, (((loli))), looking at viewer, white short hair, solo, white knee high, white socks, dynamic_angle, white jk, (cute), ((kindergarten)), red eyes, (hoodie), ((:3)),(lift by self),(underwear),((cute)),sea,genshin impact,shark
    // seed=68846426&scale=22&count=10
    const [tagText, params = ''] = args.split('\n')
    const [realTagText, paramsPostfix = ''] = tagText.split('&')
    const paramsObject = new URLSearchParams(params || paramsPostfix)
    const count = paramsObject.get('count') || 1

    if (count == 1) event.reply(this.getDrawMessage(), true)
    try {
      for (let i = 0; i < Math.min(count ? +count || 1 : 1, 10); i++) {
        if (count > 1) {
          this.hasLongTask = true
          event.reply(`开始炼金，第 ${i + 1} 张/共 ${count} 张`)
        }

        const bufferOrText = await getApiImage({
          tagText: realTagText,
          shape: command2Shape[message.commandName!] || 'Portrait',
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
    } finally {
      this.hasLongTask = false
    }

    return abort()
  }

  private async image2image(
    message: TextElem,
    event: MessageEvent,
    abort: Function,
  ) {
    const list = message.messageElems

    if (!list) {
      return abort()
    }

    const args = message.commandArgs
    if (!args) {
      return abort()
    }

    const imageElem = list.find(
      (item) => item.type == 'image' && item.file,
    ) as ImageElem
    if (!imageElem) {
      return abort()
    }

    const file = imageElem.file
    let buffer: Buffer
    if (typeof file == 'string') {
      const url = imageElem.url!

      buffer = await axios
        .get(url, {
          headers: {
            'user-agent': userAgent,
          },
          responseType: 'arraybuffer',
        })
        .then((data) => {
          return data.data
        })
    } else {
      buffer = file as Buffer
    }

    const [tagText, params = ''] = args.split('\n')
    const [realTagText, paramsPostfix = ''] = tagText.split('&')
    const paramsObject = new URLSearchParams(params || paramsPostfix)

    event.reply(this.getDrawMessage(), true)

    const resultImage = await getImage2Image({
      image: buffer,
      tagText: realTagText,
      noise: paramsObject.get('noise') || undefined,
      shape: command2Shape[message.commandName!] || 'Portrait',
      strength: paramsObject.get('strength') || undefined,
    })

    if (typeof resultImage == 'string') {
      return resultImage
    }

    event.reply(
      [
        {
          type: 'image',
          file: Buffer.from(resultImage.buffer),
        },
        {
          type: 'text',
          text: `\ntags: ${resultImage.tags}\n\nseed: ${
            resultImage.seed
          }, scale: ${paramsObject.get('scale') || `11.0`}`,
        },
      ],
      true,
    )
  }

  private async sendStatus() {
    return `AI 绘图：${this.enabled ? '开启' : '关闭'}`
  }

  async setup() {
    plugins.message.register(
      MessageType.command,
      async (event, message, prevMessage, abort) => {
        if (!('commandName' in message)) {
          return abort()
        }

        if (!message.commandName) {
          return abort()
        }

        const gEvent = event as GroupMessageEvent
        const isOwner = gEvent.sender.user_id === botConfig.ownerId
        const command = message.commandName.replaceAll('-', '_')
        if (command === 'ai_sfw_toggle') {
          if (isOwner) {
            this.enabled = !this.enabled
            return `AI 绘图：已${this.enabled ? '开启' : '关闭'}`
          }
          return prevMessage
        }

        if (!this.enabled) {
          return prevMessage
        }

        switch (command) {
          case 'ai_sfw_l':
          case 'ai_sfw_p':
          case 'ai_sfw_s':
          case 'draw':
            await this.draw(message, event, abort)
            return

          case 'ai_sfw_status':
          case 'ai_status':
            return this.sendStatus()
          case 'ai_save':
            if (isOwner) {
              return this.saveFormula(
                message,
                event as GroupMessageEvent,
                abort,
              )
            } else {
              event.reply('你不是我的主人，无法使用此命令', true)
              return abort()
            }

          case 'ai_img2img':
          case 'ai_image2image': {
            return this.image2image(message, event, abort)
          }
          case 'ai_formula':
            return this.readFormula().then((arr) => {
              return arr
                .map(
                  ([comment, formula], index) =>
                    `${index + 1}, ${comment}：${formula}`,
                )
                .join('\n')
            })
          case 'ai_sfw_formula':
          case 'ai_use':
            return this.useFormula(message, event as GroupMessageEvent, abort)
          // case ''
          case 'ai_help':
            return (
              `AI 绘图：${this.enabled ? '开启' : '关闭'}\n\n` +
              `ai_sfw_l: 横屏\nai_sfw_p: 竖屏\nai_sfw_s: 正方形\nai_sfw_toggle: 开关\nai_sfw_status: 状态\nai_help: 帮助\n\n参数：\nseed: 随机种子\nscale: CFG 倍数\ncount: 生成数量\n\n例子：\n/ai_sfw_l masterpiece,best quality,extremely detailed CG unity 8k wallpaper` +
              `\n/ai_sfw_l masterpiece,best quality,extremely detailed CG unity 8k wallpaper&seed=68846426&scale=22&count=10\n` +
              `使用配方： /ai_sfw_formula {{index}}\n\n` +
              `保存配方： /ai_save \n\n` +
              `查看配方： /ai_formula`
            )
          default:
            return prevMessage
        }
      },
    )
  }
}

const novelAi = new NovelAiStatic()

export const register = (_ctx: Client) => {
  novelAi.setup()
  return novelAi
}
