import path from 'path'
import { createClient, Platform } from 'icqq'
import { botConfig } from '../config'
import { groupMessageHandler } from './handlers/group'

const client = createClient({
  log_level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  platform: Platform.old_Android,
  data_dir: path.join(process.cwd(), 'data'),
})

client.on('system.online', () => console.log('Logged in!'))
client.on('message.group', async (e) => {
  const { group_id } = e

  if (botConfig.groupIds.includes(group_id)) {
    return await groupMessageHandler(e)
  }
})

client.on('system.login.slider', (e) => {
  console.log(`输入滑块地址获取的 ticket 后继续。\n滑块地址：   ${e.url}`)
  process.stdin.once('data', (data) => {
    client.submitSlider(data.toString().trim())
  })
})
client.on('system.login.qrcode', (e) => {
  console.log('扫码完成后回车继续：   ')
  process.stdin.once('data', () => {
    client.login()
  })
})
client.on('system.login.device', (e) => {
  console.log('请选择验证方式:(1：短信验证   其他：扫码验证)')
  process.stdin.once('data', (data) => {
    if (data.toString().trim() === '1') {
      client.sendSmsCode()
      console.log('请输入手机收到的短信验证码：')
      process.stdin.once('data', (res) => {
        client.submitSmsCode(res.toString().trim())
      })
    } else {
      console.log(`扫码完成后回车继续：${e.url}`)
      process.stdin.once('data', () => {
        client.login()
      })
    }
  })
})
client.login(botConfig.uid, botConfig.password)

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
