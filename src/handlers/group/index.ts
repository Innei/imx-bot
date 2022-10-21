import type { GroupMessageEvent, MessageElem, TextElem } from 'oicq'

import { handleCommandMessage } from '../shared/command'
import { handleMentionMessage } from './mention'
import { handleSingleMessage } from './single'

export const groupMessageHandler = async (e: GroupMessageEvent) => {
  // const coTask = new Co()
  // coTask.use(groupSingleTextMessageAction)
  // coTask.start(e)

  // consola.debug(e.message)

  // return

  const isSingleMessage = e.message.length === 1
  const isAtMessage = e.message[0].type === 'at'
  const isCommandMessage =
    e.message[0].type === 'text' && e.message[0].text.trim().startsWith('/')

  e.message.forEach((item) => {
    ;(item as TextElem).messageElems = e.message
  })
  if (isSingleMessage) {
    return await handleSingleMessage(e, e.message[0])
  }

  if (isAtMessage) {
    return await handleMentionMessage(e, e.message)
  }

  if (isCommandMessage) {
    return await handleCommandMessage(e, e.message[0] as TextElem)
  }
}

declare module 'oicq' {
  export interface TextElem {
    /**
     * 消息列表挂载，GroupMessage
     */
    messageElems?: MessageElem[]
  }
}
