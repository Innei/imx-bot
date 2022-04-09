import { GroupMessageEvent } from 'oicq'

import { handleMentionMessage } from './handle-mention'
import { handleSingleMessage } from './handle-single'

export const groupMessageHandler = async (e: GroupMessageEvent) => {
  console.log(e.message)

  const isSingleMessage = e.message.length === 1
  const isAtMessage = e.message[0].type === 'at'

  if (isSingleMessage) {
    return await handleSingleMessage(e, e.message[0])
  }

  if (isAtMessage) {
    return await handleMentionMessage(e, e.message)
  }
}
