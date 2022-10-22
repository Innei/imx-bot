import type { MessageElem, MessageEvent, Sendable } from 'oicq'
import { Client } from 'oicq'

declare module 'oicq' {
  interface Client {
    use: (registerFn: (client: Client) => any) => any
  }
}

Client.prototype.use = async function (
  this: Client,
  registerFn: (client: Client) => any,
) {
  await registerFn(this)
}

export enum MessageType {
  single = 'single',
  command = 'command',
}

type MessageHandlerResult = Sendable | 'handled' | void | undefined

type MessageTypeMap = {
  single: MessageElem
  command: MessageElem
}
type Handler<T extends MessageType = MessageType> = (
  event: MessageEvent,
  message: MessageTypeMap[T],
  previousHandlerResult: MessageHandlerResult | Promise<MessageHandlerResult>,
  abort: () => void,
) => MessageHandlerResult | Promise<MessageHandlerResult>

class MessageHandler {
  private messageHandlerMap = new Map<string, Handler[]>()

  async register(type: MessageType, handler: Handler<MessageType>) {
    const handlers = this.messageHandlerMap.get(type)
    if (handlers) {
      this.messageHandlerMap.set(type, handlers.concat(handler))
    } else {
      this.messageHandlerMap.set(type, [handler])
    }
  }
}

export const plugins = {
  message: new MessageHandler(),
}

export {}
