import { botConfig } from 'config'
import createHandler from 'github-webhook-handler'
import http from 'http'
import { Client } from 'oicq'

import { IssueEvent } from './types/issue'
import { PushEvent } from './types/push'
import { WorkflowEvent } from './types/workflow'

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
      commits,
      pusher: { name: pusherName },
      repository,
    } = event.payload as PushEvent

    if ((pusherName as string).endsWith('bot')) {
      return
    }

    const { message, id: commitId } = commits[0]

    await sendMessage(
      `${pusherName} 向 ${repository.name} 提交了一个更改.\n${commitId}\n\n 提交信息：\n${message}`,
    )
  })

  handler.on('issues', async (event) => {
    if (event.payload.action !== 'opened') {
      return
    }

    const payload = event.payload as IssueEvent

    if (payload.sender.login.endsWith('bot')) {
      return
    }

    await sendMessage(
      `${payload.sender.login} 向 ${payload.repository.name} 发布了一个 Issue「#${event.payload.issue.number} - ${payload.issue.title}` +
        '\n' +
        `前往处理：${payload.issue.html_url}`,
    )
  })

  handler.on('release', async (event) => {
    const { payload } = event
    const {
      action,
      repository: { name },
      release: { tag_name },
    } = payload
    if (action !== 'released') {
      return
    }
    await sendMessage(
      `${name} 发布了一个新版本 ${tag_name}，前往查看:\n${payload.release.html_url}`,
    )
  })

  handler.on('workflow_run', async (event) => {
    const { payload } = event
    const {
      action,
      repository: { name },

      workflow: { state },
      workflow_run,
    } = payload as WorkflowEvent
    if (
      action !== 'completed' ||
      ['success', 'active', 'pending'].includes(state)
    ) {
      return
    }

    if (
      workflow_run.head_branch !== 'main' &&
      workflow_run.head_branch !== 'master'
    ) {
      return
    }
    await sendMessage(
      `${name} CI 挂了！！！！\n查看原因: ${payload.workflow_run.html_url}`,
    )
  })

  handler.on('ping', async () => {})

  async function sendMessage(message: string) {
    const tasks = botConfig.githubHook.watchGroupIds.map((id) => {
      client.sendGroupMsg(id, message)
    })

    await Promise.all(tasks)
  }
}
