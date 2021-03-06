import { Platform, createClient } from 'oicq'

import { botConfig } from '../config'
import { groupMessageHandler } from './handlers/group'
import './plugin-manager'

const account = botConfig.uid

const client = createClient(account, {
  platform: botConfig.platform ?? Platform.iPad,
  log_level: 'warn',
})

client.on('system.online', () => console.log('Logged in!'))
client.on('message.group', async (e) => {
  const { group_id } = e

  if (botConfig.groupIds.includes(group_id)) {
    return await groupMessageHandler(e)
  }
})

client.on("system.login.slider", function (e) {
  console.log("输入ticket：")
  process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
}).login(botConfig.password)

process.on('uncaughtException', (err) => {
  console.error(err)
  client.sendGroupMsg(
    botConfig.errorNotify.groupId,
    `${formatNow()}\n[${err.name || 'ERROR'}] ${err.message}\n${err.stack}`,
  )
})
process.on('unhandledRejection', (err) => {
  console.error(err)
  if (err instanceof Error) {
    client.sendGroupMsg(
      botConfig.errorNotify.groupId,
      `${formatNow()}\n[${err.name || 'ERROR'}] ${err.message}\n${err.stack}`,
    )
  } else if (typeof err === 'string') {
    client.sendGroupMsg(
      botConfig.errorNotify.groupId,
      `${formatNow()}\n[ERROR] ${err}`,
    )
  }
})

export { client }

function formatNow() {
  return Intl.DateTimeFormat(undefined, {
    timeStyle: 'long',
    dateStyle: 'medium',
  }).format(new Date())
}
