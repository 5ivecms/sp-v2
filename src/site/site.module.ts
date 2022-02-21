import { Module } from '@nestjs/common';
import { SiteService } from './site.service';

@Module({
  providers: [SiteService],
})
export class SiteModule {}
