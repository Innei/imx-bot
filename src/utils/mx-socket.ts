import { io } from 'socket.io-client'

import { botConfig } from '../../config'
import { createNamespaceLogger } from './logger'

const logger = createNamespaceLogger('mx-socket')
export const mxSocket = io(botConfig.mxSpace?.gateway, {
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
    logger.log('message: ', payload)
  },
)
