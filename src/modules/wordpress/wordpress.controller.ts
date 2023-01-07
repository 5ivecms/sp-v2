import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { GetKeywordsDto, ParseKeywordsDto } from './dto'
import { SaveArticleDto } from './dto/save-article.dto'
import { WordpressService } from './wordpress.service'

@Controller('api/wordpress')
export class WordpressController {
  constructor(public readonly wordpressService: WordpressService) {}

  @Post('parse-articles')
  public parseArticles() {
    return this.wordpressService.parseArticles()
  }

  @Get('get-keywords')
  public getKeywords(@Query() dto: GetKeywordsDto) {
    return this.wordpressService.getKeywords(dto)
  }

  @Post('save-articles')
  public saveArticles(@Body() dto: SaveArticleDto) {
    return this.wordpressService.saveArticles([dto])
  }
}
