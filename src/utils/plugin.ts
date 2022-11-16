import type { Client } from 'oicq'

class Plugin {
  private _plugins: ((client: Client, ...args: any[]) => any)[]
  constructor() {
    this._plugins = []
  }

  register(plugin) {
    this._plugins.push(plugin)
  }

  getPlugins() {
    return this._plugins.concat()
  }

  runAsyncWaterfall(client: Client, ...args) {
    let current = Promise.resolve()
    return Promise.all(
      this._plugins.map((plugin) => {
        current = current.then(() => plugin(client, ...args))
        return current
      }),
    )
  }
}

export const hook = new Plugin()
