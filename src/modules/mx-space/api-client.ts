import type { AxiosResponse } from 'axios'
import chalk from 'chalk'
import { botConfig } from 'config'

import { allControllers, createClient } from '@mx-space/api-client'
import { axiosAdaptor } from '@mx-space/api-client/dist/adaptors/axios'

import { userAgent } from '~/constants/env'
import { createNamespaceLogger } from '~/utils/logger'

const logger = createNamespaceLogger('mx-space-api')

// const prettyStringify = (data: any) => {
//   return JSON.stringify(data, null, 2)
// }

declare module 'axios' {
  interface AxiosRequestConfig {
    __requestStartedAt?: number
    __requestEndedAt?: number
    __requestDuration?: number
  }
}

axiosAdaptor.default.interceptors.request.use((req) => {
  // req.__requestStartedAt = performance.now()

  //   logger.debug(
  //     `HTTP Request: [${req.method?.toUpperCase()}] ${req.baseURL || ''}${
  //       req.url
  //     }
  // params: ${prettyStringify(req.params)}
  // data: ${prettyStringify(req.data)}`,
  //   )

  req.headers = {
    ...req.headers,
    'user-agent': userAgent,
    authorization: botConfig.mxSpace.token,
    'x-request-id': Math.random().toString(36).slice(2),
  } as any

  return req
})
axiosAdaptor.default.interceptors.response.use(
  (res: AxiosResponse) => {
    // const endAt = performance.now()
    // res.config.__requestEndedAt = endAt
    // res.config.__requestDuration =
    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   res.config?.__requestStartedAt ?? endAt - res.config!.__requestStartedAt!
    // logger.debug(
    //   `HTTP Response ${`${res.config.baseURL || ''}${
    //     res.config.url
    //   }`} +${res.config.__requestDuration.toFixed(2)}ms: `,
    //   res.data,
    // )
    return res
  },
  (err) => {
    const res = err.response

    const error = Promise.reject(err)
    if (!res) {
      return error
    }
    logger.error(
      chalk.red(
        `HTTP Response Failed ${`${res.config.baseURL || ''}${
          res.config.url
        }`}`,
      ),
    )

    return error
  },
)
const apiClient = createClient(axiosAdaptor)(botConfig.mxSpace?.apiEndpoint, {
  controllers: allControllers,
})

export { apiClient }
