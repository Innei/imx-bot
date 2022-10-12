import axios from 'axios'
import { botConfig } from 'config'

import { novelAiLogger } from './logger'

const endpoint = 'http://91.217.139.190:5010/got_image'

const token = botConfig.novelai.token

const disallowedTags = [
  'underwear',
  'swimsuit',
  'pantsu',
  'skirt_lift',
  'breasts',
  'thighhighs',
  'stockings',
  'pantyhose',
  'bikini',
  'garter',
  'garterbelt',
  'highheels',
  'lingerie',
  'maid',
  'nurse',
  'swimsuit',
  'underwear',
  'yandere',
  'yuri',
  'cum_inside',
  'cum_outside',
  'peeing ',
  'nipple_tweak  ',
  'slave',
  'bondage',
  'nipple_torture ',
  'femdom',
  'reverse_cowgirl ',
  'girl_on_top',
  'cowgirl_position ',
  'nyotaimori',
  'pegging ',
  'milk_squirt',
  'ass/oshiri/butt ',
  'spitroast',
  'rape ',
  'rape',
  'forced_orgasm',
  'frogtie',
  'ball gag',
  'hogtie',
  'anal_fisting',
  'fisting',
  'artificial_vagina',
  '',
  'fanny packing',
  'transformation',
  'paizuri',
  'nipple_piercing ',
  'pee',
  'triple_penetration ',
  'ejaculation',
  'cum',
  'cum_in_pussy',
  'cum on body',
  'cum_on_food',
  'cum_on_hair',
  'cum_on_breast',
  'body_writing',
  'deepthroat',
  'rope',
  'bdsm',
  'wetlabia',
  'anal_fingering',
  'bound_arms',
  'fingering',
  'bound_wrists',
  'ass_grab',
  'bestiality',
  'double_dildo',
  'futanari',
  'double_penetration',
  'double_anal',
  'double_vaginal',
  'underwater_sex',
  'mind_control',
  'handjob',
  'shaved_pussy',
  'cunnilingus',
  'egg_vibrator',
  'double_handjob',
  'x-ray/cross-section/internal_cumshot',
  'thigh_sex',
  'buttjob',
  'breast_feeding',
  'faceless_male',
  'breast_pump/milking_machine',
  'breast_sucking/nipple_suck',
  'bathing',
  'tally',
  'sex',
  'sex machine',
  'grinding',
  'molestation',
  'twincest',
  'humiliation',
  'suspension',
  'blood',
  'facial',
  'multiple_insertions',
  'tentacles_under_clothes',
  'vibrator under clothes',
  'covered_erect_nipples',
  'penetration',
  'overflow',
  'semen on labia',
  'vaginal juice',
  'cleave_gag',
  'panty_gag',
  'spread_ass',
  'fingering',
  'handjob',
  'fruit_insertion',
  'standing sex',
  'vibrator',
  'vibrator_in_thighhighs',
  'extreme_content',
  'breast_grab',
  'cervix',
  'breast_hold',
  'masturbation',
  'footjob',
  'facesitting',
  'string_panties',
  'bustier',
  'bra',
  'nipples',
  'inverted_nipples',
  'areola',
  'puffy_nipples',
  'erect_nipples',
  'small_nipples',
  'small_breasts',
  'genderswap',
  'breasts',
  'chest',
  'mole_on_breast',
  'hair_between_eyes',
  'armpit',
  'armpit_hair',
  'heterochromia',
  'clitoris',
  'pussy',
  'vaginal',
  'penis',
  'pubic_hair',
  'cyborg',
  'quadruple amputee',
]
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
  const tagSet = new Set(tagText.split(',').map((t) => t.trim()))

  for (const disallowedTag of disallowedTags) {
    tagSet.delete(disallowedTag)
  }

  const jointTag = [...tagSet.values()].join(',')
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
