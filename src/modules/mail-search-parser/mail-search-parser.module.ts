import { Module } from '@nestjs/common'
import { BrowserModule } from '../browser/browser.module'
import { MailSearchMultiParserController } from './mail-search-multi-parser.controller'
import { MailSearchMultiParserService } from './mail-search-multi-parser.service'
import { MailSearchParserController } from './mail-search-parser.controller'
import { MailSearchParserService } from './mail-search-parser.service'

@Module({
  imports: [BrowserModule],
  controllers: [MailSearchParserController, MailSearchMultiParserController],
  providers: [MailSearchParserService, MailSearchMultiParserService],
  exports: [MailSearchParserService, MailSearchMultiParserService],
})
export class MailSearchParserModule {}
