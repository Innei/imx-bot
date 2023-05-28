import type { GroupMessageEvent, Sendable } from 'icqq'

type CommandReturnValue =
  | Promise<void>
  | void
  | undefined
  | Promise<undefined>
  | string
  | Promise<string>
  | Sendable
  | Promise<Sendable>
class CommandRegistry<Event> {
  private readonly commandMap = new Map<
    string,
    (event: Event) => CommandReturnValue
  >()

  private readonly wildcardCommandHandlerList = [] as ((
    event: Event,
    abort: () => void,
  ) => Promise<Sendable | void>)[]

  register(command: string, handler: (event: Event) => CommandReturnValue) {
    if (this.commandMap.has(command)) {
      throw new Error(`Command ${command} already registered`)
    }
    this.commandMap.set(command, handler)

    return () => {
      this.removeCommand(command)
    }
  }

  registerWildcard(
    handler: (event: Event, abort: () => void) => Promise<Sendable | void>,
  ) {
    this.wildcardCommandHandlerList.push(handler)

    return () => {
      const idx = this.wildcardCommandHandlerList.findIndex(
        (fn) => fn === handler,
      )
      return idx > -1 && this.wildcardCommandHandlerList.splice(idx, 1)
    }
  }

  getHandler(command: string) {
    return this.commandMap.get(command)
  }

  get handlerList() {
    return [...this.wildcardCommandHandlerList]
  }

  removeCommand(command: string) {
    this.commandMap.delete(command)
  }
}

export const commandRegistry = new CommandRegistry<GroupMessageEvent>()
