import fs from 'fs'
import { readdir } from 'fs/promises'
import { resolve } from 'path'

import { createNamespaceLogger } from '~/utils/logger'
import { hook } from '~/utils/plugin'

const logger = createNamespaceLogger('module-loader')
export const registerModules = async () => {
  const modules = await readdir(resolve(__dirname))

  modules.forEach((moduleName) => {
    // 跳过禁用的组件
    if (moduleName.startsWith('_')) return

    const modulePath = resolve(__dirname, moduleName)

    if (!fs.statSync(modulePath).isDirectory()) {
      return
    }

    logger.log(`register module: ${moduleName}`)
    try {
      const { register } = require(modulePath)
      hook.register(register)
    } catch (err) {
      logger.error(`register module: ${moduleName} failed`)
      consola.error(err)
    }
  })
}
