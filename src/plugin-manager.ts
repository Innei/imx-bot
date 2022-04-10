import { Client, MessageElem, MessageEvent, Sendable } from 'oicq'

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

type MessageHandlerResult = string | undefined | null

type MessageTypeMap = {
  single: MessageElem
  command: MessageElem
}
type Handler<T extends MessageType = MessageType> = (
  event: MessageEvent,
  message: MessageTypeMap[T],
  previousHandlerResult: MessageHandlerResult | Promise<MessageHandlerResult>,
) => MessageHandlerResult | Promise<MessageHandlerResult>

class MessageHandler {
  private messageHandlerMap = new Map<string, Handler[]>()
  async handle(
    event: MessageEvent,
    type: MessageType,
  ): Promise<Sendable | undefined> {
    const handlers = this.messageHandlerMap.get(type)

    if (!handlers) {
      return
    }
    return (
      (await handlers.reduce(async (acc: any, handler, index) => {
        const message = (() => {
          switch (type) {
            case MessageType.single:
            case MessageType.command:
              return (event as any).message[0]
          }
        })()

        return (
          (await handler(event, message || (event as any).message, acc)) || acc
        )
      }, '')) || ''
    )
  }

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
