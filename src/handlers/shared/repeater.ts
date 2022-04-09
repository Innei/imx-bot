import { Message } from 'oicq'

import { createNamespaceLogger } from '~/utils/logger'

const idToMessageQueue = new Map<string, string[]>()

const count = 3

const logger = createNamespaceLogger('repeater')
export const isMessageRepeater = async (id: string, message: Message) => {
  const stringifyMessage = message.toString()

  logger.debug(`check message: ${stringifyMessage}`)

  if (idToMessageQueue.has(id)) {
    const messageQueue = idToMessageQueue.get(id)

    const lastestMessageInQueue = messageQueue.at(-1)
    if (lastestMessageInQueue === stringifyMessage) {
      messageQueue.push(stringifyMessage)
    } else {
      messageQueue.length = 0
      messageQueue.push(stringifyMessage)
    }

    if (messageQueue.length >= count) {
      messageQueue.length = 0

      logger.log(`repeated message: ${stringifyMessage}`)
      return true
    }

    idToMessageQueue.set(id, [...messageQueue])
  } else {
    idToMessageQueue.set(id, [stringifyMessage])
  }

  return false
}
