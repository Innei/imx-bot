import { Client } from 'oicq'

import { mxSocket } from './socket'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'

export const register = async (client: Client) => {
  const [user, aggregateData] = await Promise.all([
    userStore.fetchUser(),
    aggregateStore.fetch(),
  ])
  userStore.setUser(user)
  aggregateStore.setData(aggregateData)

  mxSocket.connect()
}
