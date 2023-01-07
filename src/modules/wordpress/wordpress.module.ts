import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ArticleGeneratorModule } from '../article-generator/article-generator.module'
import { LinksFilterModule } from '../links-filter/links-filter.module'
import { MailSearchParserModule } from '../mail-search-parser/mail-search-parser.module'
import { WordpressCommand } from './wordpress.command'
import { WordpressController } from './wordpress.controller'
import { WordpressService } from './wordpress.service'

@Module({
  imports: [MailSearchParserModule, LinksFilterModule, ArticleGeneratorModule, ConfigModule],
  controllers: [WordpressController],
  exports: [WordpressService, WordpressCommand],
  providers: [WordpressService, WordpressCommand],
})
export class WordpressModule {}
