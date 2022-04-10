import { register as registerMxSpace } from './plugins/mx-space'
import { registerLogger } from './utils/logger'

async function bootstrap() {
  registerLogger()

  import('./client').then(({ client }) => {
    client.login()
    registerMxSpace(client)
  })
}

bootstrap()
