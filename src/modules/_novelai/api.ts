import axios from 'axios'
import { botConfig } from 'config'
import { URLSearchParams } from 'url'

import { userAgent } from '~/constants/env'
import { sleep } from '~/utils/helper'
import { AsyncQueue } from '~/utils/queue'

import { disallowedTags } from './ban'
import { novelAiLogger } from './logger'

const endpoint = 'http://91.217.139.190:5010'

const token = botConfig.novelai.token

export const aiRequestQueue = new AsyncQueue(1)

interface NovelAIParams {
  tagText: string
  shape: 'Portrait' | 'Landscape' | 'Square'
  scale: number | string
  seed?: number | string
}
export const getApiImage = async (
  params: Partial<NovelAIParams>,
): Promise<
  | string
  | {
      buffer: ArrayBuffer
      seed: string | undefined
      tags: string
    }
> => {
  const { seed, tagText, scale, shape = 'Portrait' } = params

  if (!tagText) {
    return ''
  }
  const tagSet = new Set(tagText.split(',').map((t) => t.trim()))

  const jointTag = [...tagSet.values()]
    .join(',')
    .replace(
      new RegExp(`(${disallowedTags.map((tag) => `${tag}|`).join('')})`, 'ig'),
      '',
    )
  const nextParams: any = {
    token,
    tags: jointTag,
    // r18,
    shape,
    scale,
    seed,
  }
  if (seed == -1) {
    delete nextParams.seed
  }

  for (const key in nextParams) {
    if (typeof nextParams[key] === 'undefined') {
      delete nextParams[key]
    }
  }

  const search = new URLSearchParams(Object.entries(nextParams)).toString()

  const request = aiRequestQueue.enqueue(() => {
    return axios
      .get(`${endpoint}/got_image?${search}`, {
        timeout: 60 * 1000,
        headers: {
          'user-agent': userAgent,
        },
        responseType: 'arraybuffer',
      })
      .then((res) => {
        novelAiLogger.debug(
          `get image from novelAI: ${res.status}, seed: ${res.headers['seed']}`,
        )
        return {
          buffer: res.data as ArrayBuffer,
          seed: res.headers['seed'],
          tags: jointTag,
        }
      })
      .catch((er: any) => {
        novelAiLogger.debug(er.message)
        return '生成失败'
      })
  })

  // 等待 10 秒
  aiRequestQueue.enqueue(() => sleep(10 * 1000))
  return request
}

export interface Image2ImageParams {
  noise: number | string
  strength: number | string

  image: Buffer
}
export const getImage2Image = async (
  params: Partial<Pick<NovelAIParams, 'tagText' | 'shape'> & Image2ImageParams>,
) => {
  const { tagText = '', image } = params

  if (!tagText) {
    return ''
  }

  if (!image) {
    return ''
  }

  const tagSet = new Set(tagText.split(',').map((t) => t.trim()))

  const jointTag = [...tagSet.values()]
    .join(',')
    .replace(
      new RegExp(`(${disallowedTags.map((tag) => `${tag}|`).join('')})`, 'ig'),
      '',
    )

  const nextParams: any = {
    ...params,
    tags: jointTag,
    token,
  }
  delete nextParams.tagText
  delete nextParams.image

  for (const key in nextParams) {
    if (typeof nextParams[key] === 'undefined') {
      delete nextParams[key]
    }
  }

  const search = new URLSearchParams(Object.entries(nextParams)).toString()

  return aiRequestQueue.enqueue(() =>
    axios
      .post(`${endpoint}/got_image2image?${search}`, image.toString('base64'), {
        timeout: 60 * 1000,
        headers: {
          'user-agent': userAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        responseType: 'arraybuffer',
      })
      .then((res) => {
        novelAiLogger.debug(
          `get image from novelAI: ${res.status}, seed: ${res.headers['seed']}`,
        )
        return {
          buffer: res.data as ArrayBuffer,
          seed: res.headers['seed'],
          tags: jointTag,
        }
      })
      .catch((er: any) => {
        novelAiLogger.debug(er.message)
        return '生成失败'
      }),
  )
}
