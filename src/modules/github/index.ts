import { botConfig } from 'config'
import createHandler from 'github-webhook-handler'
import http from 'http'
import { Client } from 'oicq'

import { botList } from './constants/bot'
import { CheckRun } from './types/check-run'
import { IssueEvent } from './types/issue'
import { PushEvent } from './types/push'

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

    if (
      (pusherName as string).endsWith('[bot]') ||
      botList.includes(pusherName)
    ) {
      return
    }

    const { message } = Array.isArray(commits) ? commits[0] : commits

    await sendMessage(
      `${pusherName} 向 ${repository.name} 提交了一个更改\n\n${message}`,
    )
  })

  handler.on('issues', async (event) => {
    if (event.payload.action !== 'opened') {
      return
    }

    const payload = event.payload as IssueEvent

    if (
      payload.sender.login.endsWith('[bot]') ||
      botList.includes(payload.sender.login)
    ) {
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

  handler.on('check_run', async (event) => {
    const { payload } = event
    const {
      check_run: {
        conclusion,
        status,
        html_url,
        check_suite: { head_branch },
      },

      repository: { name },
    } = payload as CheckRun

    if (!['master', 'main'].includes(head_branch)) {
      return
    }

    if (status !== 'completed') {
      return
    }

    if (conclusion && ['failure', 'timed_out'].includes(conclusion)) {
      await sendMessage(`${name} CI 挂了！！！！\n查看原因: ${html_url}`)
    }
  })

  handler.on('ping', async () => {})

  async function sendMessage(message: string) {
    const tasks = botConfig.githubHook.watchGroupIds.map((id) => {
      client.sendGroupMsg(id, message)
    })

    await Promise.all(tasks)
  }
}
