import PKG from 'package.json'

import { isDev } from '~/constants/env'
import { toolCommand } from '~/handlers/shared/commands/tool'
import { commandRegistry } from '~/registries/command'
import { createNamespaceLogger } from '~/utils/logger'

import type { GroupCoRoutine } from '../types'

const logger = createNamespaceLogger('commander')
export const commandMessageRoutine: GroupCoRoutine = async function (event) {
  if (!event.commandMessage || !event.commandName) {
    this.next()
    return
  }

  const { commandName, commandParsedArgs: args, shouldQuote = false } = event

  logger.debug('commandName: ', commandName)

  switch (commandName) {
    case 'tool': {
      event.reply(await toolCommand(args), shouldQuote)
      break
    }
    case 'ping':
      event.reply('pong', shouldQuote)
      break
    case 'version':
      if (isDev) {
        event.reply(`v${PKG.version} (dev)`, shouldQuote)
        break
      }
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

  // handle command registry

  const handler = commandRegistry.getHandler(commandName)

  if (handler) {
    const result = await handler(event)
    const isSendable = checkIsSendable(result)

    if (isSendable) {
      event.reply(result as any, shouldQuote)
    }

    this.abort()
  }

  const wildcardHandlerList = commandRegistry.handlerList
  for await (const handler of wildcardHandlerList) {
    const result = await handler(event, this.abort)
    const isSendable = checkIsSendable(result)

    if (isSendable && result) {
      event.reply(result, shouldQuote)

      // 终止
      this.abort()
    }
  }

  // 没有匹配到命令也终止
  this.abort()
}

function checkIsSendable(obj: any) {
  if (!obj) {
    return false
  }
  return typeof obj === 'string' || (typeof obj === 'object' && 'type' in obj)
}
