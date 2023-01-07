import { registerAs } from '@nestjs/config'

export default registerAs('browser', () => ({
  headless: process.env.BROWSER_HEADLESS || 1,
}))
