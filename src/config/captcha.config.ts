import { registerAs } from '@nestjs/config'

export default registerAs('captchaConfig', () => ({
  captchaService: process.env.CAPTCHA_SERVICE,
  captchaRemoteServiceUrl: process.env.CAPTCHA_REMOTE_SERVICE_URL,
}))
