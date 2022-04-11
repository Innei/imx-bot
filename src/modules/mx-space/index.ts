import { botConfig } from 'config'
import { CronJob } from 'cron'
import { sample } from 'lodash'
import { Client } from 'oicq'

import { createNamespaceLogger } from '~/utils/logger'

import { fetchHitokoto } from './api/hitokoto'
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

    const { hitokoto } = await fetchHitokoto()

    client.sendGroupMsg(
      e.group_id,
      `欢迎新大佬 ${e.nickname}(${e.user_id})！\n${hitokoto || ''}`,
    )
  })

  const sayGoodMorning = new CronJob('0 0 6 * * *', async () => {
    const { hitokoto } = await fetchHitokoto()
    const greeting = sample([
      '新的一天也要加油哦',
      '今天也要元气满满哦！',
      '今天也是充满希望的一天',
    ])
    const tasks = botConfig.mxSpace.watchGroupIds.map((id) =>
      client.sendGroupMsg(id, `早上好！${greeting}\n\n${hitokoto || ''}`),
    )

    await Promise.all(tasks)
  })

  const sayGoodEvening = new CronJob('0 0 22 * * *', async () => {
    const { hitokoto } = await fetchHitokoto()
    const tasks = botConfig.mxSpace.watchGroupIds.map((id) =>
      client.sendGroupMsg(id, `晚安，早点睡哦！\n\n${hitokoto || ''}`),
    )

    await Promise.all(tasks)
  })

  sayGoodMorning.start()
  sayGoodEvening.start()

  return {
    socket,
    job: {
      sayGoodMorning,
      sayGoodEvening,
    },
  }
}
