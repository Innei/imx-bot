import type { Message } from 'icqq'
import { createNamespaceLogger } from '~/utils/logger'

const idToMessageQueue = new Map<string, string[]>()

const count = 3

const breakRepeatCount = 12

const logger = createNamespaceLogger('repeater')
export const isMessageRepeater = async (id: string, message: Message) => {
  const stringifyMessage = message.toString()

  logger.debug(`check message: ${stringifyMessage}`)

  if (idToMessageQueue.has(id)) {
    const messageQueue = idToMessageQueue.get(id)!

    const lastestMessageInQueue = messageQueue.at(-1)

    if (lastestMessageInQueue === stringifyMessage) {
      messageQueue.push(stringifyMessage)
    } else {
      messageQueue.length = 0
      messageQueue.push(stringifyMessage)
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
    idToMessageQueue.set(id, [stringifyMessage])
  }

  return false
}
