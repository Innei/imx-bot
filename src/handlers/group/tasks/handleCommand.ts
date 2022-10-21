import PKG from 'package.json'

import { toolCommand } from '~/handlers/shared/commands/tool'

import type { GroupCoRoutine } from '../types'

export const commandMessageRoutine: GroupCoRoutine = async function (event) {
  if (!event.commandMessage) {
    this.next()
    return
  }

  const { commandName, commandParsedArgs: args, shouldQuote = false } = event

  switch (commandName) {
    case 'tool': {
      event.reply(await toolCommand(args), shouldQuote)
      break
    }
    case 'ping':
      event.reply('pong', shouldQuote)
      break
    case 'version':
      event.reply(
        `imx-bot: v${PKG.version || process.env.npm_package_version}` +
          '\n' +
          `author: Innei\nframework: oicq-bot`,
        shouldQuote,
      )
      break
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

      event.reply(message, shouldQuote)
      break
    }
  }

  this.abort()
}
