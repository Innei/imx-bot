import type { GroupMessageEvent, Sendable } from 'icqq'
import { checkIsSendable } from '~/utils/message'

type MessageReturnValue =
  | Promise<void>
  | void
  | undefined
  | Promise<undefined>
  | string
  | Promise<string>
  | Sendable
  | Promise<Sendable>
class MentionRegistry {
  private handlerList = [] as ((
    event: GroupMessageEvent,
    abort: () => void,
  ) => MessageReturnValue)[]
  register(
    handler: (
      event: GroupMessageEvent,
      abort: () => void,
    ) => MessageReturnValue,
  ) {
    this.handlerList.push(handler)
    return () => {
      const idx = this.handlerList.findIndex((fn) => fn === handler)
      return idx > -1 && this.handlerList.splice(idx, 1)
    }
  }

  async runWaterfall(event: GroupMessageEvent) {
    const abort = () => {
      throw new AbortError()
    }
    for await (const handler of this.handlerList) {
      try {
        const result = await handler(event, abort)
        if (result) {
          if (checkIsSendable(result)) {
            return event.reply(result as any)
          }
          return result
        }
      } catch (err) {
        if (err instanceof AbortError) {
          break
        } else {
          throw err
        }
      }
    }
  }
}

class AbortError extends Error {}

export const mentionRegistry = new MentionRegistry()
