import axios from 'axios'

const endpoint = 'http://91.217.139.190:5010/got_image'

const token = 'public_token'

interface NovelAIParams {
  tagText: string
  shape: 'Portrait' | 'Landscape' | 'Square'
  scale: number
  seed?: number
}
export const getApiImage = async (params: Partial<NovelAIParams>) => {
  const { seed = -1, tagText = '', scale = 22, shape = 'Portrait' } = params

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

  return await axios
    .get(endpoint, {
      params: nextParams,
      timeout: 60 * 1000,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
      responseType: 'arraybuffer',
    })
    .then((res) => {
      return res.data as ArrayBuffer
    })
    .catch(() => {
      return '生成失败'
    })
}
