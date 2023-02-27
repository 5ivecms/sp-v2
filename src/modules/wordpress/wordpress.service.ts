/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { Worker } from 'worker_threads'
import { GetKeywordsDto, SaveArticleDto } from './dto'
import { WordpressApiUrls } from './wordpress.constants'
import { WordpressKeyword } from './wordpress.types'
import { parseArticlesFilePath } from '../../worker-threads/config'

@Injectable()
export class WordpressService {
  private readonly domain: string
  private readonly threads: number

  constructor(private readonly configService: ConfigService) {
    this.domain = this.configService.get<string>('wordpress.domain')
    this.threads = +this.configService.get<number>('wordpress.threads')
  }

  public async parseArticles() {
    const promises = []
    for (let i = 0; i < this.threads; i++) {
      promises.push(this.parseArticlesWorker())
    }
    await Promise.all(promises)
  }

  public async getKeywords(dto: GetKeywordsDto) {
    const limit = dto.limit || 10

    try {
      const { data } = await axios.get<WordpressKeyword[]>(`${this.domain}${WordpressApiUrls.GET_KEYWORDS}`, {
        params: { limit },
      })
      return data
    } catch (e) {
      console.error(e)
      throw new Error('Error when getting keywords')
    }
  }

  public async saveArticles(dto: SaveArticleDto[]) {
    try {
      await axios.post(`${this.domain}${WordpressApiUrls.SAVE_ARTICLE}`, dto, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 240000,
      })
      return true
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        console.log('AXIOS TIMEOUT ПРИ ПОСТИНГЕ')
      } else {
        console.log(e)
      }
      return false
    }
  }

  public findKeywordByText(keywords: WordpressKeyword[], text: string): WordpressKeyword | null {
    return keywords.find((keyword) => keyword.keyword === text)
  }

  private async parseArticlesWorker() {
    return new Promise((resolve, reject) => {
      const worker = new Worker(parseArticlesFilePath)
      worker.on('message', resolve)
      worker.on('error', reject)
    })
  }
}
