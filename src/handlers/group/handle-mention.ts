import { GroupMessageEvent, MessageElem } from 'oicq'

import { handleCommandMessage } from './handld-command'

// [
//   { type: 'at', qq: 926284623, text: '@金色离婚证' },
//   { type: 'text', text: ' ' }
// ]
export const handleMentionMessage = async (
  event: GroupMessageEvent,
  message: MessageElem[],
) => {
  const afterMentionMessage = message[1]

  if (afterMentionMessage) {
    const isText = afterMentionMessage.type == 'text'
    const isCommand = isText && afterMentionMessage.text.trim().startsWith('/')

    if (isCommand) {
      return await handleCommandMessage(event, afterMentionMessage, true)
    }
  }
}
