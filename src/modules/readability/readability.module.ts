import { Module } from '@nestjs/common'
import { ReadabilityController } from './readability.controller'
import { ReadabilityService } from './readability.service'

@Module({
  controllers: [ReadabilityController],
  exports: [ReadabilityService],
  providers: [ReadabilityService],
})
export class ReadabilityModule {}
