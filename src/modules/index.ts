import { readdir } from 'fs/promises'
import { resolve } from 'path'

import { createNamespaceLogger } from '~/utils/logger'
import { hook } from '~/utils/plugin'

const logger = createNamespaceLogger('module-loader')
export const registerModules = async () => {
  const modules = await readdir(resolve(__dirname))

  modules.forEach((module) => {
    if (module.startsWith('index.')) {
      return
    }
    logger.log(`register module: ${module}`)
    try {
      const { register } = require(resolve(__dirname, module))
      hook.register(register)
    } catch (err) {
      logger.error(`register module: ${module} failed`)
      consola.error(err)
    }
  })
}
