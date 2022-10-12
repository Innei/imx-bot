import axios from 'axios'
import { botConfig } from 'config'

import { novelAiLogger } from './logger'

const endpoint = 'http://91.217.139.190:5010/got_image'

const token = botConfig.novelai.token

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
    return 'Tag 为空'
  }

  const jointTag = [...new Set(tagText.split(',')).values()].join(',')
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

  return await axios
    .get(`${endpoint}?${search}`, {
      timeout: 60 * 1000,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
      responseType: 'arraybuffer',
    })
    .then((res) => {
      novelAiLogger.debug(
        `get image from novelai: ${res.status}, seed: ${res.headers['seed']}`,
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
}
