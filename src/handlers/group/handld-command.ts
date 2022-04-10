import { GroupMessageEvent, TextElem } from 'oicq'

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
