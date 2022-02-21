import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';

@Module({
  providers: [CaptchaService],
})
export class CaptchaModule {}
