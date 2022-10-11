import type { Client } from 'oicq'

import { MessageType, plugins } from '~/plugin-manager'

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
    await plugins.message.register(
      MessageType.command,
      async (event, message, prevMessage) => {
        if (!('commandName' in message)) {
          return prevMessage
        }

        if (message.commandName === 'health') {
          return await this.call().then((result) => {
            return result.join('\n')
          })
        }
        return prevMessage
      },
    )
  }
}

export const healthCheck = new HealthCheckStatic()

export const register = (ctx: Client) => {
  healthCheck.setup()
  return healthCheck
}
