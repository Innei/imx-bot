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
  client.use(registerHealthCheck)
  client.use(registerMxSpace)
  client.use(registerGithubHook)
  client.use(registerBilibili)
  client.use(registerAi)
}
bootstrap()
