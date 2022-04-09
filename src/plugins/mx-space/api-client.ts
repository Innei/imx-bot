import { AxiosRequestConfig } from 'axios'
import chalk from 'chalk'
import { botConfig } from 'config'
import PKG from 'package.json'

import { allControllers, createClient } from '@mx-space/api-client'
import { axiosAdaptor } from '@mx-space/api-client/lib/adaptors/axios'

import { consola } from '~/utils/logger'

axiosAdaptor.default.defaults.headers.common[
  'user-agent'
] = `imx-bot/${PKG.version}`

axiosAdaptor.default.interceptors.request.use((req) => {
  consola.debug(`[${chalk.green(req.method)}]: ${req.url}`)

  return req
})

axiosAdaptor.default.interceptors.response.use(undefined, (err) => {
  const request = err.config as AxiosRequestConfig

  if (request) {
    consola.error(
      `[${chalk.red(request.method)}]: ${request.url}, ${err.message}`,
    )
  }
  return Promise.reject(err)
})

const apiClient = createClient(axiosAdaptor)(botConfig.mxSpace?.apiEndpoint, {
  controllers: allControllers,
})

export { apiClient }
