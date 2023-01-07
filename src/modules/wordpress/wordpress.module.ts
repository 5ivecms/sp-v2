import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { WordpressCommand } from './wordpress.command'
import { WordpressController } from './wordpress.controller'
import { WordpressService } from './wordpress.service'

@Module({
  imports: [ConfigModule],
  controllers: [WordpressController],
  exports: [WordpressService, WordpressCommand],
  providers: [WordpressService, WordpressCommand],
})
export class WordpressModule {}
