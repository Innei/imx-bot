import { registerLogger } from './utils/logger'
import { mxSocket } from './utils/mx-socket'

async function bootstrap() {
  registerLogger()

  mxSocket.connect()

  import('./client').then(({ client }) => {
    client.login()
  })
}

bootstrap()
