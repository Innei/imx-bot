/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { botConfig } from 'config'
import { CronJob } from 'cron'
import { sample } from 'lodash'
import type { Client } from 'oicq'

import { createNamespaceLogger } from '~/utils/logger'

import { healthCheck } from '../health-check'
import { fetchHitokoto } from './api/hitokoto'
import { listenMessage } from './message'
import mxSocket from './socket'
import { aggregateStore } from './store/aggregate'
import { userStore } from './store/user'
import type { MxContext } from './types'

const logger = createNamespaceLogger('mx-space')
export const register = async (client: Client) => {
  logger.info('module loading...')

  const initData = async () => {
    const [user, aggregateData] = await Promise.all([
      userStore.fetchUser(),
      aggregateStore.fetch(),
    ])
    userStore.setUser(user)
    aggregateStore.setData(aggregateData)
  }

  try {
    await initData()
  } catch (err) {
    consola.error(err)
    process.exit(-1)
  }

  const socket = mxSocket(client)
  socket.connect()

  logger.info('module loaded!')

  const ctx: MxContext = {
    socket,
    client,
    aggregationData: aggregateStore.aggregate!,

    refreshData: initData,
  }

  listenMessage(ctx)

  client.on('notice.group.increase', async (e) => {
    if (!botConfig.mxSpace.watchGroupIds.includes(e.group_id)) {
      return
    }

    const { hitokoto } = await fetchHitokoto()

    client.sendGroupMsg(e.group_id, [
      { type: 'text', text: `欢迎新大佬 ` },
      { type: 'at', qq: e.user_id },
      { type: 'text', text: `(${e.user_id})！\n${hitokoto || ''}` },
    ])
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

  healthCheck.registerHealthCheck(() => {
    return `Mx Socket connected: ${
      socket.connected ? 'connected' : 'disconnected'
    }`
  })

  return {
    socket,
    job: {
      sayGoodMorning,
      sayGoodEvening,
    },
  }
}
