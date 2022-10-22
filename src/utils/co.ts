export interface CoCallerAction {
  abort: () => void
  next: () => Promise<void> | void
}

type Caller<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = {},
> = (this: CoCallerAction & Ctx, ...args: Args) => void | Promise<void>

export class CoAbortError extends Error {
  get [Symbol.toStringTag]() {
    return 'CoAbortError'
  }
}

class Runner<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = any,
> {
  private caller: Caller<Args, Ctx> = null!
  private nextSibling: Runner<Args, Ctx> | null = null
  private ctx: Ctx = null as any
  constructor(
    private readonly options: {
      nextSibling: Runner<Args, Ctx> | null
      caller: Caller<Args, Ctx>

      ctx?: Ctx
    },
  ) {
    this.caller = options.caller
    this.nextSibling = options.nextSibling
    this.ctx = (options.ctx || {}) as any
  }

  public setNextSibling(runner: Runner<Args, Ctx>) {
    this.nextSibling = runner
  }

  public async run(args: Args) {
    const callerAction: CoCallerAction = {
      abort() {
        throw new CoAbortError()
      },
      next: async () => {
        if (this.nextSibling) {
          await this.nextSibling.run(args)
        }
      },
    }

    try {
      await this.caller.call(Object.assign({}, callerAction, this.ctx), ...args)
    } catch (err) {
      if (err instanceof CoAbortError) {
        return
      }
      throw err
    }
  }
}
export class Co<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = any,
> {
  private queue: Runner<Args, Ctx>[] = []
  private ctx: Ctx
  constructor(ctx?: Ctx) {
    this.queue = []
    this.ctx = ctx ?? ({} as any)
  }

  use(...actions: ((...args: Args) => void)[]) {
    for (let i = 0; i < actions.length; i++) {
      this.queue.push(
        new Runner({
          nextSibling: null,
          caller: actions[i],
        }),
      )
    }

    for (let i = 0; i < actions.length - 1; i++) {
      const currentRunner = this.queue[i]
      const nextRunner = this.queue[i + 1]
      if (nextRunner) {
        currentRunner.setNextSibling(nextRunner)
      }
    }
  }

  async start(...args: Args) {
    const runner = this.queue[0]
    if (runner) {
      await runner.run(args)
      return
    }
  }
}
