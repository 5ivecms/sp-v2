import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BrowserController } from './browser.controller'
import { BrowserService } from './browser.service'

@Module({
  imports: [ConfigModule],
  controllers: [BrowserController],
  exports: [BrowserService],
  providers: [BrowserService],
})
export class BrowserModule {}
