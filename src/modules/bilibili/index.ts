import axios from 'axios'
import { botConfig } from 'config'
import { CronJob } from 'cron'
import type { Client } from 'oicq'

import { userAgent } from '~/constants/env'

import type { BLRoom } from './types/room'
import type { BLUser } from './types/user'

const headers = {
  referer: `https://link.bilibili.com/p/center/index?visit_id=22ast2mb9zhc`,
  'User-Agent': userAgent,
}

export const register = (client: Client) => {
  let playStatus = false
  const config = botConfig.bilibili

  const liveId = config.live.id
  const work = async () => {
    const res = await axios
      .get(
        `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${liveId}&protocol=0,1&format=0,1,2&codec=0,1&qn=0&platform=web&ptype=8&dolby=5`,
        {
          headers,
        },
      )
      .catch((err) => null)

    if (!res?.data) {
      return
    }

    if (res?.data?.data.playurl_info) {
      if (playStatus) {
        return
      }

      const userInfo = await axios
        .get(
          `https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveId}`,
          {
            headers,
          },
        )
        .catch((err) => null)

      if (!userInfo?.data) {
        return
      }

      const info = (userInfo.data as BLUser).data.info

      const bgBuffer = await axios
        .get(
          ` https://api.live.bilibili.com/xlive/web-room/v1/index/getRoomBaseInfo?room_ids=${liveId}&req_biz=link-center`,
          {
            headers,
          },
        )
        .then((res) => {
          return (res.data as BLRoom).data.by_room_ids[liveId].cover
        })
        .catch((err) => null)
        .then((url) => {
          if (url) {
            return axios
              .get(url, {
                headers,
                responseType: 'arraybuffer',
              })
              .then((res) => res.data as Buffer)
              .catch((err) => null)
          }
          return null
        })
        .then((buffer) => {
          return buffer
        })

      await Promise.all(
        config.watchGroupIds.map(async (groupId) => {
          await client.sendGroupMsg(groupId, [
            bgBuffer
              ? { type: 'image', file: bgBuffer }
              : {
                  type: 'text',
                  text: '',
                },
            config.live.atAll
              ? { type: 'at', qq: 'all', text: ' ' }
              : { type: 'text', text: '' },
            {
              type: 'text',
              text: `${info.uname}(${info.uid}) 开播了\n\n前往直播间: https://live.bilibili.com/${liveId}`,
            },
          ])
        }),
      )

      playStatus = true
    } else {
      playStatus = false
    }
  }
  const job = new CronJob('*/1 * * * *', work)
  job.start()
  work()
}
