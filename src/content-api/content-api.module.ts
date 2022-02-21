import { Module } from '@nestjs/common';
import { ContentApiService } from './content-api.service';

@Module({
  providers: [ContentApiService],
})
export class ContentApi {}
