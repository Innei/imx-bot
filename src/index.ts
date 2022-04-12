import { register as registerGithubHook } from './modules/github'
import { register as registerMxSpace } from './modules/mx-space'
import { registerLogger } from './utils/logger'

async function bootstrap() {
  registerLogger()

  import('./client').then(({ client }) => {
    client.login()
    client.use(registerMxSpace)
    client.use(registerGithubHook)
  })
}
bootstrap()
