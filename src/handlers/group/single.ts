import type { GroupMessageEvent, MessageElem } from 'oicq'

import { MessageType, plugins } from '~/plugin-manager'

import { handleCommandMessage } from '../shared/command'
import { isMessageRepeater } from '../shared/repeater'

export const handleSingleMessage = async (
  event: GroupMessageEvent,
  message: MessageElem,
) => {
  // 复读机

  const isRepeater = await isMessageRepeater(event.group_id.toString(), event)
  if (isRepeater === true) {
    return event.reply(message)
  } else if (isRepeater === 'break') {
    return event.reply('打断复读！！！！')
  }

  switch (message.type) {
    case 'text': {
      let res = textMap[message.text]
      const isCommand = message.text.startsWith('/')

      if (isCommand) {
        const isReplied = await handleCommandMessage(event, message)
        if (isReplied) {
          return
        }
      }

      const messagePluginHandled = await plugins.message.handle(
        event,
        MessageType.single,
      )

      if (messagePluginHandled) {
        return await event.reply(messagePluginHandled)
      }

      if (typeof res === 'function') {
        res = await res()
      }

      if (typeof res != 'undefined') {
        return event.reply(res.toString())
      }
    }
  }
}

const textMap: Record<string, any> = {
  ping: 'pong',
}
