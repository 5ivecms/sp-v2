import { Module } from '@nestjs/common'
import { BrowserModule } from '../browser/browser.module'
import { MailSearchParserController } from './mail-search-parser.controller'
import { MailSearchParserService } from './mail-search-parser.service'

@Module({
  imports: [BrowserModule],
  controllers: [MailSearchParserController],
  providers: [MailSearchParserService],
  exports: [MailSearchParserService],
})
export class MailSearchParserModule {}
