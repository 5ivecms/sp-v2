import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BrowserModule } from '../browser/browser.module'
import { XEvilModule } from '../xevil/xevil.module'
import { YandexSearchParserController } from './yandex-search-parser.controller'
import { YandexSearchParserService } from './yandex-search-parser.service'

@Module({
  imports: [BrowserModule, ConfigModule, XEvilModule],
  controllers: [YandexSearchParserController],
  providers: [YandexSearchParserService],
  exports: [YandexSearchParserService],
})
export class YandexSearchParserModule {}
