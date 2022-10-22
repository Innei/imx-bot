import type { Client } from 'oicq'

import { commandRegistry } from '~/registries/command'

class HealthCheckStatic {
  checkFnList = [() => 'UP!'] as Array<() => string | Promise<string>>
  registerHealthCheck(checkFn: () => string | Promise<string>) {
    this.checkFnList.push(checkFn)

    return () => {
      const idx = this.checkFnList.findIndex((fn) => fn === checkFn)
      return idx > -1 && this.checkFnList.splice(idx, 1)
    }
  }
  call() {
    return Promise.all(this.checkFnList.map((fn) => fn()))
  }

  async setup() {
    commandRegistry.register('health', async () => {
      return (await this.call().then((result) => {
        return result.join('\n')
      })) as string
    })
  }
}

export const healthCheck = new HealthCheckStatic()

export const register = (ctx: Client) => {
  healthCheck.setup()
  return healthCheck
}
