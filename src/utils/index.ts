export const getExtension = (filename: string) => filename.split('.').pop()

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000)
  var seconds = Number(((millis % 60000) / 1000).toFixed(0))
  return minutes + 'm' + ':' + (seconds < 10 ? '0' : '') + seconds + 's'
}
