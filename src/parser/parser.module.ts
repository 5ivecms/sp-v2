import { Module } from '@nestjs/common';
import { ContentApiService } from '../content-api/content-api.service';
import { CaptchaService } from '../captcha/captcha.service';
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';
import { SiteService } from '../site/site.service';

@Module({
  imports: [],
  controllers: [ParserController],
  providers: [ParserService, CaptchaService, ContentApiService, SiteService],
})
export class ParserModule {}
