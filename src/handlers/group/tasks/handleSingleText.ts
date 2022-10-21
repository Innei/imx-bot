import type { GroupCoRoutine } from '../types'

// export const handleSingleText = async (event: GroupMessageEvent) => {
//   const message = event.message[0]
//   switch (message.type) {
//     case 'text': {
//       let res = textMap[message.text]
//       const isCommand = message.text.startsWith('/')

//       if (isCommand) {
//         const isReplied = await handleCommandMessage(event, message)
//         if (isReplied || isReplied === 'handled') {
//           return
//         }
//       }

//       const messagePluginHandled = await plugins.message.handle(
//         event,
//         MessageType.single,
//       )

//       if (messagePluginHandled) {
//         return await event.reply(messagePluginHandled)
//       }

//       if (typeof res === 'function') {
//         res = await res()
//       }

//       if (typeof res != 'undefined') {
//         return event.reply(res.toString())
//       }
//     }
//   }

//   // TODO
//   // // 复读机

//   // const isRepeater = await isMessageRepeater(event.group_id.toString(), event)
//   // if (isRepeater === true) {
//   //   return event.reply(message)
//   // } else if (isRepeater === 'break') {
//   //   return event.reply('打断复读！！！！')
//   // }

//   // const textMap: Record<string, any> = {
//   //   ping: 'pong',
//   // }
// }

export const groupSingleTextMessageAction: GroupCoRoutine = function (event) {
  if (event.message.length === 1 && event.message[0].type === 'text') {
    this.abort()
  }
  this.next()
}
