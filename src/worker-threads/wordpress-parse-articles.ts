/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { parentPort, threadId } from 'worker_threads'
import { ConfigService } from '@nestjs/config'
import { ArticleGeneratorService } from '../modules/article-generator/article-generator.service'
import { AppModule } from '../app.module'
import { WordpressService } from '../modules/wordpress/wordpress.service'
import { MailSearchParserService } from '../modules/mail-search-parser/mail-search-parser.service'
import { ParseArticle } from '../modules/wordpress/wordpress.types'
import { LinksFilterService } from '../modules/links-filter/links-filter.service'
import { GenerateArticleDto } from '../modules/article-generator/dto'
import { millisToMinutesAndSeconds } from '../utils'
import { chunk } from 'lodash'

// Добавить время выполнения потока
async function wordpressParseArticlesWorker() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const configService = app.get(ConfigService)
  const wordpressService = app.get(WordpressService)
  const articleGeneratorService = app.get(ArticleGeneratorService)
  const mailSearchParserService = app.get(MailSearchParserService)
  const linksFilterService = app.get(LinksFilterService)
  const keywordsPerTread = +configService.get<number>('wordpress.keywordsPerTread')

  let isParsing = true

  while (isParsing) {
    const start = new Date().getTime()
    console.log(`Генерация статей начата, threadId ${threadId}`)
    let keywords = []

    try {
      keywords = await wordpressService.getKeywords({ limit: keywordsPerTread })
    } catch (e) {
      console.log(e)
      isParsing = false
      console.log(`Ошибка при получении ключей, парсинг остановлен, threadId ${threadId}`)
      continue
    }

    if (!keywords.length) {
      console.log(`Нет ключей, threadId ${threadId}`)
      isParsing = false
      continue
    }

    const articlesData: GenerateArticleDto[] = []
    await mailSearchParserService.parse(
      keywords.map(({ keyword }) => keyword),
      async (data) => {
        if (!data?.keyword) {
          return
        }
        const { keyword, urls } = data
        const filteredUrls = linksFilterService.filter({ urls })
        const urlChunk = chunk(filteredUrls, 10)[0]
        articlesData.push({ keyword, urls: urlChunk, addSource: true })
      }
    )

    const generatedResult = await Promise.all(
      articlesData.map((articleData) => articleGeneratorService.generate(articleData))
    )

    const notEmptyArticles = generatedResult.filter((article) => article !== null)

    const parseArticles: ParseArticle[] = notEmptyArticles.map(({ keyword, article, excerpt }) => ({
      keyword: wordpressService.findKeywordByText(keywords, keyword),
      article: { content: article, shortContent: excerpt, tableContent: '', thumb: '' },
    }))

    const end = new Date().getTime()
    const time = end - start
    console.log(`Генерация статей завершена, threadId ${threadId}: ${millisToMinutesAndSeconds(time)}`)

    console.log(generatedResult.length, parseArticles.length)
    await wordpressService.saveArticles(parseArticles)

    const postingEnd = new Date().getTime()
    const postingEndTime = postingEnd - start
    console.log(`Постинг статей завершен, threadId ${threadId}: ${millisToMinutesAndSeconds(postingEndTime)}`)
  }

  parentPort.postMessage(true)
}

wordpressParseArticlesWorker()
