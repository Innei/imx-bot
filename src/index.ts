import { register as registerMxSpace } from './modules/mx-space'
import { registerLogger } from './utils/logger'

async function bootstrap() {
  registerLogger()

  import('./client').then(({ client }) => {
    client.login()
    client.use(registerMxSpace)
  })
}

bootstrap().catch((error) => {
  console.error(error)
})

process.on('uncaughtException', (err) => {
  console.error(err)
})
process.on('unhandledRejection', (err) => {
  console.error(err)
})
