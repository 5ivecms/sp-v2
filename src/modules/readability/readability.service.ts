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
      const { data, headers } = await axios.get<string>(url, { timeout: 60000 })

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
      //console.log(e)
      return null
    }
  }

  private articlesFilter(htmlString: string) {}
}
