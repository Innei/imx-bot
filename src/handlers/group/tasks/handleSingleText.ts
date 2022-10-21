import { isMessageRepeater } from '~/handlers/shared/repeater'
import { praseCommandMessage } from '~/utils/message'

import type { GroupCoRoutine } from '../types'

export const groupSingleTextMessageAction: GroupCoRoutine = async function (
  event,
) {
  if (event.message.length === 1 && event.message[0].type === 'text') {
    const text = event.message[0].text.trim()

    const isCommand = text.startsWith('/')
    if (isCommand) {
      const { commandArgs, commandName, commandParsedArgs } =
        await praseCommandMessage(text, event.message[0])

      event.commandName = commandName
      event.commandArgs = commandArgs
      event.commandParsedArgs = commandParsedArgs
      event.commandMessage = event.message[0]
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
