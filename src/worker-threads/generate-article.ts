import { parentPort, workerData } from 'worker_threads'
import * as sanitizeHtml from 'sanitize-html'
import { JSDOM, VirtualConsole } from 'jsdom'
import { Readability } from '@mozilla/readability'
import { GenerateArticleDto } from '../modules/article-generator/dto'
import { GetReadabilityArticleByUrlsDto } from '../modules/readability/dto'
import { ReadabilityArticle } from '../modules/readability/readability.types'
import axios from 'axios'

const MIN_ARTICLE_LENGTH = 1000
const MIN_ARTICLE_COUNT = 5

/* async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const wordpressService = app.get(WordpressService)
  const articleGeneratorService = app.get(ArticleGeneratorService)

  const data: GenerateArticleDto = workerData

  wordpressService.checkMainThread()
  const result = await articleGeneratorService.generate({ ...data, addSource: true })
  parentPort.postMessage(result)
}

run() */

async function run() {
  const data: GenerateArticleDto = workerData

  const result = await generate({ ...data, addSource: true })
  parentPort.postMessage(result)
}

run()

async function generate(dto: GenerateArticleDto) {
  const { urls, keyword, addSource } = dto

  const readabilityArticles = await getReadabilityArticleByUrls({ urls })
  const sanitizedArticles = readabilityArticles
    .filter((article) => article.length >= MIN_ARTICLE_LENGTH)
    .map((article) => ({ ...article, content: sanitize(article.content) }))

  if (sanitizedArticles.length < MIN_ARTICLE_COUNT) {
    return null
  }

  const resultArticlesContent: string[] = []
  sanitizedArticles.forEach((articleData) => {
    resultArticlesContent.push(articleData.content)
    if (addSource) {
      resultArticlesContent.push(generateSourceBlock(articleData.url))
    }
  })

  const article = resultArticlesContent.join('\n')

  return { article, keyword }
}

async function getReadabilityArticleByUrls(dto: GetReadabilityArticleByUrlsDto) {
  const { urls } = dto
  const result = await Promise.allSettled(urls.map(async (url) => await readability(url)))
  const fulfilledData = result.filter((data) => data.status === 'fulfilled')
  const readabilityArticles = fulfilledData.map((data: any) => data.value as ReadabilityArticle)
  return readabilityArticles
}

function generateSourceBlock(url: string) {
  return `<div class="source-url"><a href="${url}" rel="noopener">Источник</a></div>`
}

function sanitize(content: string): string {
  const sanitizeHtmlArticleContent = sanitizeHtml(content, {
    allowedTags: [
      'img',
      'address',
      'article',
      'aside',
      'footer',
      'header',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hgroup',
      'main',
      'nav',
      'section',
      'blockquote',
      'dd',
      'div',
      'dl',
      'dt',
      'figcaption',
      //'figure',
      'hr',
      'li',
      'main',
      'ol',
      'p',
      'pre',
      'ul',
      //'a',
      'abbr',
      'b',
      'bdi',
      'bdo',
      'br',
      'cite',
      'code',
      'data',
      'dfn',
      'em',
      'i',
      'kbd',
      'mark',
      'q',
      'rb',
      'rp',
      'rt',
      'rtc',
      'ruby',
      's',
      'samp',
      'small',
      'span',
      'strong',
      'sub',
      'sup',
      'time',
      'u',
      'var',
      'wbr',
      //'caption',
      'col',
      'colgroup',
      'table',
      'tbody',
      'td',
      'tfoot',
      'th',
      'thead',
      'tr',
    ],
  })
  return sanitizeHtmlArticleContent
}

async function readability(url: string): Promise<ReadabilityArticle> {
  const result = await axios.get(url, { timeout: 5000 })
  const virtualConsole = new VirtualConsole()
  const doc = new JSDOM(result.data, { url, virtualConsole })

  const article = new Readability(doc.window.document, { debug: false }).parse() as ReadabilityArticle

  return { ...article, url }
}
