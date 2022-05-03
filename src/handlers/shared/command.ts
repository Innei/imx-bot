import { GroupMessageEvent, TextElem } from 'oicq'
import PKG from 'package.json'
import { performance } from 'perf_hooks'
import yargs from 'yargs'

import { MessageType, plugins } from '~/plugin-manager'

import { toolCommand } from './commands/tool'

export const handleCommandMessage = async (
  event: GroupMessageEvent,
  message: TextElem,

  quote?: boolean,
) => {
  if (!message) {
    return
  }

  const command = message.text.trim().slice(1)

  // replace mac qq auto replace `--` to ch `—`
  const args = await yargs.parse(command.replace(/—/g, '--'), {})
  const commandName = args._[0]

  switch (commandName) {
    case 'tool': {
      return event.reply(await toolCommand(args), quote)
    }
    case 'ping':
      return event.reply('pong', quote)
    case 'version':
      return event.reply(
        `imx-bot: v${PKG.version || process.env.npm_package_version}` +
          '\n' +
          `author: Innei\nframework: oicq-bot`,
        quote,
      )
    case 'uptime': {
      const T = performance.now()
      const M = 24 * 60 * 60 * 1000
      const a = T / M
      const A = Math.floor(a)
      const b = (a - A) * 24
      const B = Math.floor(b)
      const c = (b - B) * 60
      const C = Math.floor((b - B) * 60)
      const D = Math.floor((c - C) * 60)

      const message = `已运行: ${A}天${B}小时${C}分${D}秒`

      return event.reply(message, quote)
    }
  }

  const result = await plugins.message.handle(event, MessageType.command)
  if (result) {
    return event.reply(result, quote)
  }
}
