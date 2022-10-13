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

class Abort extends Error {}

class MessageHandler {
  private messageHandlerMap = new Map<string, Handler[]>()
  async handle(
    event: MessageEvent,
    type: MessageType,
  ): Promise<Sendable | 'handled' | undefined> {
    const handlers = this.messageHandlerMap.get(type)

    if (!handlers) {
      return
    }
    const abort = () => {
      throw new Abort()
    }

    const result: Promise<any> = handlers.reduce(async (acc: any, handler) => {
      if (acc == 'handled') {
        return acc
      }
      const message = (() => {
        switch (type) {
          case MessageType.single:
            return (event as any).message[0]
          case MessageType.command: {
            // @ts-ignore
            const message: MessageElem = event.message[0]

            switch (message.type) {
              case 'text': {
                const fullCommand = message.text.slice(1)
                const commandSplit = fullCommand.split(' ')
                const [commandName, ...rest] = commandSplit

                const args = rest.join(' ')

                message.commandName = commandName
                message.commandArgs = args
              }
            }

            return message
          }
        }
      })()

      return (
        (await handler(event, message || (event as any).message, acc, abort)) ||
        acc
      )
    }, '')

    return (
      (await result.catch((err) => {
        if (err instanceof Abort) {
          return 'handled'
        }
        throw err
      })) || ''
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

declare module 'oicq' {
  interface TextElem {
    commandName?: string
    commandArgs?: string
  }
}

export const plugins = {
  message: new MessageHandler(),
}

export {}
