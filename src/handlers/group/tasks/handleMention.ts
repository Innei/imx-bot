import { praseCommandMessage } from '~/utils/message'

import type { GroupCoRoutine } from '../types'

// [
//   { type: 'at', qq: 926284623, text: '@金色离婚证' },
//   { type: 'text', text: ' ' }
// ]

export const mentionRoutine: GroupCoRoutine = async function (event) {
  const messages = event.message

  const mentionMessageIndex = messages.findIndex((message) => {
    return message.type === 'at'
  })

  const isMentionMessage = mentionMessageIndex !== -1

  if (!isMentionMessage) {
    this.next()
    return
  }
  // const mentionMessageElem = messages[mentionMessageIndex]
  const afterMentionMessageElem = messages[mentionMessageIndex + 1]

  if (afterMentionMessageElem) {
    const isText = afterMentionMessageElem.type == 'text'

    if (isText) {
      const result = await praseCommandMessage(
        afterMentionMessageElem.text,
        afterMentionMessageElem,
      )

      Object.assign(event, result)
      event.commandMessage = afterMentionMessageElem
      event.shouldQuote = true

      return this.next()
    }
  } else {
    event.reply('没事别艾特我！！')
  }

  this.abort()
}
