import { GroupMessageEvent, MessageElem } from 'oicq'

export const handleSingleMessage = async (
  event: GroupMessageEvent,
  message: MessageElem,
) => {
  switch (message.type) {
    case 'text': {
      let res = textMap[message.text]

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
