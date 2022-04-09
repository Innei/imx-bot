import { GroupMessageEvent, MessageElem, TextElem } from 'oicq'

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
      return await handleCommandMessage(event, afterMentionMessage)
    }
  }
}

export const handleCommandMessage = async (
  event: GroupMessageEvent,
  message: TextElem,
) => {
  if (!message) {
    return
  }

  const command = message.text.trim().slice(1)

  switch (command) {
    case 'ping':
      return event.reply('pong')
  }
}
