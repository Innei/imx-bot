import { GroupMessage, GroupMessageEvent } from 'oicq'
import { handleSingleMessage } from './handle-single-message'

// [
//   { type: 'at', qq: 926284623, text: '@金色离婚证' },
//   { type: 'text', text: ' ' }
// ]

export const groupMessageHandler = async (e: GroupMessageEvent) => {
  console.log(e.message)

  const isSingleMessage = e.message.length === 1
  const isAtMessage = e.message[0].type === 'at'

  if (isSingleMessage) {
    return await handleSingleMessage(e, e.message[0])
  }
  //

  for (const msg of e.message) {
    if (msg.type === 'text') {
      const text = msg.text
    }
  }
}
