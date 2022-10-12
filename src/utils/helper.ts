import axios from 'axios'
import { isIPv4, isIPv6 } from 'net'

import { camelcaseKeys } from '@mx-space/api-client'

export const getIpInfo = async (ip: string) => {
  const isV4 = isIPv4(ip)
  const isV6 = isIPv6(ip)
  if (!isV4 && !isV6) {
    return 'error' as const
  }

  if (isV4) {
    const { data } = await axios.get(`https://api.i-meto.com/ip/v1/qqwry/${ip}`)
    return camelcaseKeys(data, { deep: true }) as IpType
  } else {
    const { data } = (await axios.get(`http://ip-api.com/json/${ip}`)) as any

    return {
      cityName: data.city,
      countryName: data.country,
      ip: data.query,
      ispDomain: data.as,
      ownerDomain: data.org,
      regionName: data.region_name,
    }
  }
}

export interface IpType {
  ip: string
  countryName: string
  regionName: string
  cityName: string
  ownerDomain: string
  ispDomain: string
  range?: {
    from: string
    to: string
  }
}
