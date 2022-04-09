import { GroupMessageEvent, MessageElem } from 'oicq'

import { isMessageRepeater } from '../shared/repeater'

export const handleSingleMessage = async (
  event: GroupMessageEvent,
  message: MessageElem,
) => {
  switch (message.type) {
    case 'text': {
      let res = textMap[message.text]

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

const textMap = {
  ping: 'pong',
  cal: () => 1 + 1,
}
