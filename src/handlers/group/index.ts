import type { GroupMessageEvent } from 'oicq'

import { handleMentionMessage } from './mention'
import { handleSingleMessage } from './single'

export const groupMessageHandler = async (e: GroupMessageEvent) => {
  consola.debug(e.message)

  const isSingleMessage = e.message.length === 1
  const isAtMessage = e.message[0].type === 'at'

  if (isSingleMessage) {
    return await handleSingleMessage(e, e.message[0])
  }

  if (isAtMessage) {
    return await handleMentionMessage(e, e.message)
  }
}
