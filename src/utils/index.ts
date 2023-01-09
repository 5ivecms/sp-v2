export const getExtension = (filename: string) => filename.split('.').pop()

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000)
  var seconds = Number(((millis % 60000) / 1000).toFixed(0))
  return minutes + 'm' + ':' + (seconds < 10 ? '0' : '') + seconds + 's'
}

export const parseMillisecondsIntoReadableTime = (milliseconds: number) => {
  const hours = milliseconds / (1000 * 60 * 60)
  const absoluteHours = Math.floor(hours)
  const h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours

  const minutes = (hours - absoluteHours) * 60
  const absoluteMinutes = Math.floor(minutes)
  const m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes

  const seconds = (minutes - absoluteMinutes) * 60
  const absoluteSeconds = Math.floor(seconds)
  const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds

  return h + ':' + m + ':' + s
}
