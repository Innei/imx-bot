/** Get Time, format `12:00:00`  */
export const getShortTime = (date: Date) => {
  return Intl.DateTimeFormat('en-US', {
    timeStyle: 'medium',
    hour12: false,
  }).format(date)
}

export const getShortDate = (date: Date) => {
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
  })
    .format(date)
    .replace(/\//g, '-')
}
/** 2-12-22, 21:31:42 */
export const getShortDateTime = (date: Date) => {
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'medium',
    hour12: false,
  })
    .format(date)
    .replace(/\//g, '-')
}

export const relativeTimeFromNow = (
  time: Date | string,
  current = new Date(),
) => {
  time = new Date(time)
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = +current - +time

  if (elapsed < msPerMinute) {
    const gap = Math.ceil(elapsed / 1000)
    return gap <= 0 ? '刚刚' : `${gap} 秒`
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} 分钟`
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} 小时`
  } else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)} 天`
  } else if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)} 个月`
  } else {
    return `${Math.round(elapsed / msPerYear)} 年`
  }
}
