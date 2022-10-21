import { isMessageRepeater } from '~/handlers/shared/repeater'
import { praseCommandMessage } from '~/utils/message'

import type { GroupCoRoutine } from '../types'

export const groupSingleTextMessageAction: GroupCoRoutine = async function (
  event,
) {
  const messages = event.message
  if (messages.length !== 1) {
    this.next()
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const message = messages[0]!
  if (message.type === 'text') {
    const text = message.text.trim()

    const isCommand = text.startsWith('/')
    if (isCommand) {
      const result = await praseCommandMessage(text, message)
      Object.assign(event, result)
      event.commandMessage = message

      this.next()
      return
    }
    const isRepeater = await isMessageRepeater(event.group_id.toString(), event)
    if (isRepeater === true) {
      return event.reply(text)
    } else if (isRepeater === 'break') {
      return event.reply('打断复读！！！！')
    }
    this.abort()
  }
  this.next()
}
