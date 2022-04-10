import { GroupMessageEvent, TextElem } from 'oicq'
import PKG from 'package.json'
import { performance } from 'perf_hooks'

import { MessageType, plugins } from '~/plugin-manager'

export const handleCommandMessage = async (
  event: GroupMessageEvent,
  message: TextElem,

  quote?: boolean,
) => {
  if (!message) {
    return
  }

  const command = message.text.trim().slice(1)

  switch (command) {
    case 'ping':
      return event.reply('pong', quote)
    case 'version':
      return event.reply(
        `v${PKG.version || process.env.npm_package_version}`,
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
