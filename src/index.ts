import { register as registerBilibili } from './modules/bilibili'
import { register as registerGithubHook } from './modules/github'
import { register as registerMxSpace } from './modules/mx-space'
import { registerLogger } from './utils/logger'

async function bootstrap() {
  registerLogger()
  const { client } = require('./client')
  client.login()
  client.use(registerMxSpace)
  client.use(registerGithubHook)
  client.use(registerBilibili)
}
bootstrap()
