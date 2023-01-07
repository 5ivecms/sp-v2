import { Injectable } from '@nestjs/common'
import { chunk } from 'lodash'
import { sleep } from '../../utils'
import { SearchParserResult } from '../../types/search-parser'
import { BrowserService } from '../browser/browser.service'
import { MailSearchPage } from './mail-search.interfaces'
import MailRuSearchPage from './pages/mail-search.page'

// 7 оптимальное, 8 самое быстрое

const THREADS = 7

@Injectable()
export class MailSearchMultiParserService {
  private result: SearchParserResult[] = []
  private pages: MailSearchPage[] = []
  private browser: WebdriverIO.MultiRemoteBrowser | null

  constructor(private readonly browserService: BrowserService) {}

  public async parse(keywords: string[]) {
    // Складывать результаты при каждой итерации цикла
    this.result = []

    await this.init(THREADS)
    const keywordsThreads = chunk(keywords, THREADS)
    for (const keywordsThread of keywordsThreads) {
      await this.parseKeywords(keywordsThread)
    }
    await this.browser.deleteSession()
    await sleep(500)
    return this.getResult()
  }

  private async parseKeywords(keywords: string[]) {
    await this.openUrls(keywords)
    this.addResult(await this.getSearchResultsUrls())
  }

  private async init(countBrowsers: number) {
    const browser = await this.browserService.multiRemote(countBrowsers)
    for (let i = 0; i < countBrowsers; i++) {
      this.pages[i] = new MailRuSearchPage(browser[`browser${i}`] as WebdriverIO.Browser)
    }
    this.browser = browser
  }

  private async openUrls(keywords: string[]) {
    const promises = []
    this.pages.forEach((page, index) => {
      if (keywords[index]) {
        promises.push(page.openUrl(`https://go.mail.ru/search?q=${keywords[index]}`))
      }
    })
    await Promise.all(promises)
  }

  private async getSearchResultsUrls() {
    return (await Promise.all(this.pages.map((page) => page.getSearchResultUrls()))).filter((data) => data !== null)
  }

  public getResult() {
    return this.result
  }

  private addResult(result: SearchParserResult[]) {
    result.forEach((item) => {
      this.result.push(item)
    })
  }
}
