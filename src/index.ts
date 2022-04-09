import { register } from './plugins/mx-space'
import { registerLogger } from './utils/logger'

async function bootstrap() {
  registerLogger()

  import('./client').then(({ client }) => {
    client.login()
    register(client)
  })
}

bootstrap()
