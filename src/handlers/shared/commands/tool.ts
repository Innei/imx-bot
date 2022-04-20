import { Sendable } from 'oicq'

import { getIpInfo } from '~/utils/helper'
import { createNamespaceLogger } from '~/utils/logger'

// 优先级 ip - base64

const logger = createNamespaceLogger('tool')
export const toolCommand = async (args: any): Promise<Sendable> => {
  logger.debug(args)

  if (args.ip) {
    const ip = args.ip
    const ipInfo = await getIpInfo(ip)

    if (ipInfo === 'error') {
      return {
        type: 'text',
        text: `${ip} 不是一个有效的 IP 地址`,
      }
    }

    return {
      type: 'text',
      text: `IP: ${ipInfo.ip}\n城市: ${
        [ipInfo.countryName, ipInfo.regionName, ipInfo.cityName]
          .filter(Boolean)
          .join(' - ') || 'N/A'
      }\nISP: ${ipInfo.ispDomain || 'N/A'}\n组织: ${
        ipInfo.ownerDomain || 'N/A'
      }${
        'range' in ipInfo
          ? `\n范围: ${
              ipInfo.range ? Object.values(ipInfo.range).join(' - ') : 'N/A'
            }`
          : ''
      }`,
    }
  }

  if (args.base64 || args.base) {
    const base64 = args.base64 || args.base

    if (base64 === true) {
      return {
        type: 'text',
        text: `base64 参数不能为 true`,
      }
    }
    const decode = args.d
    let value = ''
    if (!decode) {
      value = Buffer.from(base64.toString()).toString('base64')
    } else {
      value = Buffer.from(base64.toString(), 'base64').toString()
    }

    return {
      type: 'text',

      text: `base64 ${decode ? '解码' : '编码'}结果: ${value}`,
    }
  }

  if (args.md5) {
    const toMd5Str = args.md5

    if (typeof toMd5Str !== 'string') {
      return {
        type: 'text',
        text: `md5 参数必须为字符串`,
      }
    }

    if (toMd5Str.length > 10e6) {
      return {
        type: 'text',
        text: `md5 参数长度不能超过 10MB`,
      }
    }

    return {
      type: 'text',
      text: `md5 结果: ${require('crypto')
        .createHash('md5')
        .update(toMd5Str)
        .digest('hex')}`,
    }
  }

  return {
    type: 'text',
    text: '无效指令',
  }
}
