import { Platform, createClient } from 'oicq'

import { botConfig } from '../config'
import { groupMessageHandler } from './handlers/group'

const account = botConfig.uid

const client = createClient(account, {
  platform: Platform.iPad,
})

client.on('system.online', () => console.log('Logged in!'))
client.on('message.group', async (e) => {
  const { group_id } = e

  if (botConfig.groupIds.includes(group_id)) {
    return await groupMessageHandler(e)
  }
})

client.on('system.login.qrcode', function (e) {
  process.stdin.once('data', () => {
    this.login()
  })
})

export { client }
