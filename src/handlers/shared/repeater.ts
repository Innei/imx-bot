import { Message } from 'oicq'

import { createNamespaceLogger } from '~/utils/logger'

const idToMessageQueue = new Map<string, Buffer[]>()

const count = 3

const breakRepeatCount = 3

const logger = createNamespaceLogger('repeater')
export const isMessageRepeater = async (id: string, message: Message) => {
  const stringifyMessage = message.toString()

  logger.debug(`check message: ${stringifyMessage}`)

  const serializeMessage = message.serialize()

  if (idToMessageQueue.has(id)) {
    const messageQueue = idToMessageQueue.get(id)!

    const lastestMessageInQueue = messageQueue.at(-1) || Buffer.alloc(0)

    if (Buffer.compare(lastestMessageInQueue, serializeMessage)) {
      messageQueue.push(serializeMessage)
    } else {
      messageQueue.length = 0
      messageQueue.push(serializeMessage)
    }

    if (messageQueue.length == count) {
      messageQueue.length = count + 1

      logger.log(`repeated message: ${stringifyMessage}`)
      return true
    } else if (messageQueue.length > count) {
      if (messageQueue.length - count == breakRepeatCount) {
        messageQueue.length = 0
        return 'break'
      }
    }

    idToMessageQueue.set(id, [...messageQueue])
  } else {
    idToMessageQueue.set(id, [serializeMessage])
  }

  return false
}
