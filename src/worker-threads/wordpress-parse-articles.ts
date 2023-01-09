/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { parentPort, threadId, Worker } from 'worker_threads'
import { ConfigService } from '@nestjs/config'
import { chunk } from 'lodash'
import { ArticleGeneratorService } from '../modules/article-generator/article-generator.service'
import { AppModule } from '../app.module'
import { WordpressService } from '../modules/wordpress/wordpress.service'
import { ParseArticle, WordpressKeyword } from '../modules/wordpress/wordpress.types'
import { LinksFilterService } from '../modules/links-filter/links-filter.service'
import { GenerateArticleDto } from '../modules/article-generator/dto'
import { millisToMinutesAndSeconds } from '../utils'
import { YandexSearchParserService } from '../modules/yandex-search-parser/yandex-search-parser.service'
import { MailSearchParserService } from '../modules/mail-search-parser/mail-search-parser.service'
import { generateArticlesFilePath } from './config'

// Добавить время выполнения потока
async function wordpressParseArticlesWorker() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const configService = app.get(ConfigService)
  const wordpressService = app.get(WordpressService)
  const articleGeneratorService = app.get(ArticleGeneratorService)
  const mailSearchParserService = app.get(MailSearchParserService)
  const yandexSearchParserService = app.get(YandexSearchParserService)
  const linksFilterService = app.get(LinksFilterService)
  const keywordsPerTread = +configService.get<number>('wordpress.keywordsPerTread')
  const searchEngine = configService.get<string>('searchEngine.searchEngine')

  let isParsing = true

  while (isParsing) {
    const start = new Date().getTime()
    let keywords: WordpressKeyword[] = []

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

    const parsingStart = new Date().getTime()
    console.log(`Парсим ссылки, threadId ${threadId}`)
    const articlesData: GenerateArticleDto[] = []

    if (searchEngine === 'yandex') {
      await yandexSearchParserService.parse(
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
    }

    if (searchEngine === 'mail') {
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
    }

    const parsingEnd = new Date().getTime()
    const parsingEndTime = parsingEnd - parsingStart
    console.log(`Парсинг ссылок завершен, threadId ${threadId}: ${millisToMinutesAndSeconds(parsingEndTime)}`)

    console.log(`Генерируем статьи, threadId ${threadId}`)
    const generateStart = new Date().getTime()
    const generatedResult = await Promise.all(
      articlesData.map((articleData) => articleGeneratorService.generate(articleData))
    )

    const notEmptyArticles = generatedResult.filter((article) => article !== null)

    const parseArticles: ParseArticle[] = notEmptyArticles.map(({ keyword, article, excerpt }) => ({
      keyword: wordpressService.findKeywordByText(keywords, keyword),
      article: { content: article, shortContent: excerpt, tableContent: '', thumb: '' },
    }))

    const generateEnd = new Date().getTime()
    const generateEndTime = generateEnd - generateStart
    console.log(`Генерация статей завершена, threadId ${threadId}: ${millisToMinutesAndSeconds(generateEndTime)}`)
    console.log(generatedResult.length, parseArticles.length)

    const postingStart = new Date().getTime()
    await wordpressService.saveArticles(parseArticles)
    const postingEnd = new Date().getTime()
    const postingEndTime = postingEnd - postingStart

    console.log(`Постинг статей завершен, threadId ${threadId}: ${millisToMinutesAndSeconds(postingEndTime)}`)

    const end = new Date().getTime()
    const time = end - start

    console.log('')
    console.log('')
    console.log('=================')
    console.log(`threadId: ${threadId}`)
    console.log(`Ожидание статей: ${generatedResult.length}`)
    console.log(`На выходе статей: ${parseArticles.length}`)
    console.log(`Парсинг ссылок: ${millisToMinutesAndSeconds(parsingEndTime)}`)
    console.log(`Генерация статей: ${millisToMinutesAndSeconds(generateEndTime)}`)
    console.log(`Постинг: ${millisToMinutesAndSeconds(postingEndTime)}`)
    console.log(`Время выполнения: ${millisToMinutesAndSeconds(time)}`)
    console.log('=================')
    console.log('')
    console.log('')
  }

  parentPort.postMessage(true)
}

wordpressParseArticlesWorker()
