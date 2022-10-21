interface CallerAction {
  abort: () => void
  next: () => void
}

type Caller<
  Args extends any[] = any[],
  Ctx extends Record<string, any> = {},
> = (this: CallerAction & Ctx, ...args: Args) => void

class CoAbortError extends Error {
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

  public run(args: Args) {
    const callerAction: CallerAction = {
      abort() {
        throw new CoAbortError()
      },
      next: () => {
        if (this.nextSibling) {
          this.nextSibling.run(args)
        }
      },
    }

    try {
      this.caller.call(Object.assign({}, callerAction, this.ctx), ...args)
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

  start(...args: Args) {
    const runner = this.queue[0]
    if (runner) {
      runner.run(args)
      return
    }
  }
}
