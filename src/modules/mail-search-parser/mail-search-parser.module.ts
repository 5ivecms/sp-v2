import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BrowserModule } from '../browser/browser.module'
import { XEvilModule } from '../xevil/xevil.module'
import { MailSearchParserController } from './mail-search-parser.controller'
import { MailSearchParserService } from './mail-search-parser.service'

@Module({
  imports: [BrowserModule, ConfigModule, XEvilModule],
  controllers: [MailSearchParserController],
  providers: [MailSearchParserService],
  exports: [MailSearchParserService],
})
export class MailSearchParserModule {}
