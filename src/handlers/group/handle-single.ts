import { GroupMessageEvent, MessageElem } from 'oicq'

import { MessageType, plugins } from '~/plugin-manager'

import { isMessageRepeater } from '../shared/repeater'
import { handleCommandMessage } from './handld-command'

export const handleSingleMessage = async (
  event: GroupMessageEvent,
  message: MessageElem,
) => {
  switch (message.type) {
    case 'text': {
      let res = textMap[message.text]
      const isCommand = message.text.startsWith('/')

      if (isCommand) {
        const result = await handleCommandMessage(event, message)
        if (result) {
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

      // 复读机

      const isRepeater = await isMessageRepeater(
        event.group_id.toString(),
        event,
      )
      if (isRepeater) {
        return event.reply(message.text)
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
