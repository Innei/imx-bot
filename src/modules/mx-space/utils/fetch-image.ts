import axios from 'axios'

export const fetchImageBuffer = async (src: string) => {
  const buffer: Buffer | string = await axios
    .get(src, { responseType: 'arraybuffer', timeout: 4000 })
    .then((data) => data.data)
    .then((arr) => {
      return Buffer.from(arr)
    })
    .catch(() => {
      return ''
    })

  return buffer
}
