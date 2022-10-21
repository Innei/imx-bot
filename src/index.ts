import { register as registerBilibili } from './modules/bilibili'
import { register as registerGithubHook } from './modules/github'
import { register as registerHealthCheck } from './modules/health-check'
import { register as registerMxSpace } from './modules/mx-space'
import { register as registerAi } from './modules/novelai'
import { registerLogger } from './utils/logger'

async function bootstrap() {
  registerLogger()

  const { client } = await import('./client')
  client.login()
  // TODO factory
  ;[
    registerHealthCheck,
    registerMxSpace,
    registerGithubHook,
    registerBilibili,
    registerAi,
  ].forEach((register) => register(client))
}
bootstrap()
