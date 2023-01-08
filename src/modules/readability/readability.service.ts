import { Injectable } from '@nestjs/common'
import { Readability } from '@mozilla/readability'
import { JSDOM, VirtualConsole } from 'jsdom'
import axios from 'axios'
import { ReadabilityArticle } from './readability.types'
import { GetReadabilityArticleByUrlDto, GetReadabilityArticleByUrlsDto } from './dto'

@Injectable()
export class ReadabilityService {
  public async getReadabilityArticleByUrl(dto: GetReadabilityArticleByUrlDto): Promise<ReadabilityArticle> {
    const { url } = dto
    return await this.readability(url)
  }

  public async getReadabilityArticleByUrls(dto: GetReadabilityArticleByUrlsDto): Promise<ReadabilityArticle[]> {
    const { urls } = dto
    const result = await Promise.allSettled(urls.map(async (url) => await this.readability(url)))
    const fulfilledData = result
      .filter((data) => data.status === 'fulfilled')
      .filter((data: any) => data.value !== null)
    const readabilityArticles = fulfilledData.map((data: any) => data.value as ReadabilityArticle)

    return readabilityArticles
  }

  private async readability(url: string): Promise<ReadabilityArticle | null> {
    try {
      const { data, headers } = await axios.get<string>(url, {
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.88 Safari/537.36',
          Referer: 'https://google.ru',
        },
      })

      if (headers['content-type'] === undefined || headers['content-type'] === null) {
        return null
      }

      if (headers['content-type'].indexOf('8') === -1) {
        return null
      }

      if (data.indexOf('<title>') === -1) {
        return null
      }

      const virtualConsole = new VirtualConsole()
      const doc = new JSDOM(data, { url, virtualConsole })
      const article = new Readability(doc.window.document, { debug: false }).parse() as ReadabilityArticle

      return { ...article, url }
    } catch (e) {
      //console.error(e)
      return null
    }
  }

  private articlesFilter(htmlString: string) {}
}
