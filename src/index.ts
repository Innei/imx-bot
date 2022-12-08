import { registerModules } from './modules'
import { registerLogger } from './utils/logger'
import { hook } from './utils/plugin'

async function bootstrap() {
  registerLogger()

  const { client } = await import('./client')
  client.login()

  await registerModules()
  await hook.runAsyncWaterfall(client)
}
bootstrap()
