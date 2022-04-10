import { botConfig } from 'config'
import { Client } from 'oicq'

import { createNamespaceLogger } from '~/utils/logger'

import { listenMessage } from './message'
import mxSocket from './socket'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'

const logger = createNamespaceLogger('mx-space')
export const register = async (client: Client) => {
  logger.info('plugin loading...')
  try {
    const [user, aggregateData] = await Promise.all([
      userStore.fetchUser(),
      aggregateStore.fetch(),
    ])
    userStore.setUser(user)
    aggregateStore.setData(aggregateData)
  } catch (err) {
    consola.error(err)
    process.exit(-1)
  }

  const socket = mxSocket(client)
  socket.connect()

  logger.info('plugin loaded!')

  listenMessage()

  client.on('notice.group.increase', async (e) => {
    if (!botConfig.mxSpace.watchGroupIds.includes(e.group_id)) {
      return
    }

    client.sendGroupMsg(e.group_id, `欢迎新大佬 ${e.nickname}(${e.user_id})！`)
  })

  return {
    socket,
  }
}
