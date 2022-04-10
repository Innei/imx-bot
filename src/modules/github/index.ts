import { botConfig } from 'config'
import createHandler from 'github-webhook-handler'
import http from 'http'
import { Client } from 'oicq'

export const register = (client: Client) => {
  // see: https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads
  const handler = createHandler({
    path: '/webhook',
    secret: botConfig.githubHook.secret,
  })

  http
    .createServer((req, res) => {
      handler(req, res, (err) => {
        res.statusCode = 404
        res.end('no such location')
      })
    })
    .listen(botConfig.githubHook.port)

  handler.on('error', (err) => {
    console.error('Error:', err.message)
  })

  handler.on('push', async (event) => {
    const {
      commits: {
        message,
        id: commitId,
        author: { name },
      },

      repository,
    } = event.payload

    if ((name as string).endsWith('bot')) {
      return
    }

    await sendMessage(
      `${name} 向 ${repository.name} 提交了一个 Commit. sha ${commitId}\n\n 提交信息：${message}`,
    )
  })

  handler.on('issues', async (event) => {
    if (event.payload.action !== 'opened') {
      return
    }

    const payload = event.payload

    if (payload.sender.endsWith('bot')) {
      return
    }

    await sendMessage(
      `${payload.sender.login} 向 ${payload.repository.name} 发布了一个 Issue「#${event.payload.issue.number} - ${payload.issue.title}` +
        '\n' +
        `前往处理：${payload.issue.html_url}`,
    )
  })

  async function sendMessage(message: string) {
    const tasks = botConfig.githubHook.watchGroupIds.map((id) => {
      client.sendGroupMsg(id, message)
    })

    await Promise.all(tasks)
  }
}
