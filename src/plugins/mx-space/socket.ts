import camelcaseKeys from 'camelcase-keys'
import { Client } from 'oicq'
import { io } from 'socket.io-client'

import { MxSocketEventTypes } from '~/plugins/mx-space/types/mx-socket-types'

import { botConfig } from '../../../config'
import { createNamespaceLogger } from '../../utils/logger'
import { handleEvent } from './event-handler'

const logger = createNamespaceLogger('mx-socket')

// eslint-disable-next-line import/no-default-export
export default (client: Client) => {
  const mxSocket = io(botConfig.mxSpace?.gateway, {
    transports: ['websocket'],
    timeout: 10000,
    forceNew: true,
    query: {
      token: botConfig.mxSpace.token,
    },

    autoConnect: false,
  })

  mxSocket.io.on('error', () => {
    logger.error('Socket 连接异常')
  })
  mxSocket.io.on('reconnect', () => {
    logger.info('Socket 重连成功')
  })
  mxSocket.io.on('reconnect_attempt', () => {
    logger.info('Socket 重连中')
  })
  mxSocket.io.on('reconnect_failed', () => {
    logger.info('Socket 重连失败')
  })

  mxSocket.on('disconnect', () => {
    const tryReconnect = () => {
      if (mxSocket.connected === false) {
        mxSocket.io.connect()
      } else {
        timer = clearInterval(timer)
      }
    }
    let timer: any = setInterval(tryReconnect, 2000)
  })

  mxSocket.on(
    'message',
    (payload: string | Record<'type' | 'data' | 'code', any>) => {
      if (typeof payload !== 'string') {
        return handleEvent(client)(
          payload.type,
          camelcaseKeys(payload.data, { deep: true }),
          payload.code,
        )
      }
      const { data, type, code } = JSON.parse(payload) as {
        data: any
        type: MxSocketEventTypes
        code?: number
      }
      handleEvent(client)(type, camelcaseKeys(data, { deep: true }), code)
    },
  )

  return mxSocket
}
