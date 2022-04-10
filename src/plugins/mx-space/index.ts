import { Client } from 'oicq'

import { createNamespaceLogger } from '~/utils/logger'

import mxSocket from './socket'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'

const logger = createNamespaceLogger('mx-space')
export const register = async (client: Client) => {
  logger.info('plugin loading...')

  const [user, aggregateData] = await Promise.all([
    userStore.fetchUser(),
    aggregateStore.fetch(),
  ])
  userStore.setUser(user)
  aggregateStore.setData(aggregateData)

  const socket = mxSocket(client)
  socket.connect()

  logger.info('plugin loaded!')

  return {
    socket,
  }
}
