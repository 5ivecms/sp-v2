import { Module } from '@nestjs/common'
import { BrowserController } from './browser.controller'
import { BrowserService } from './browser.service'

@Module({
  controllers: [BrowserController],
  exports: [BrowserService],
  providers: [BrowserService],
})
export class BrowserModule {}
