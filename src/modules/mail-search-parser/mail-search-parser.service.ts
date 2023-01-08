import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { sleep } from '../../utils'
import { BrowserService } from '../browser/browser.service'
import { MailSearchPage } from './mail-search.interfaces'
import MailRuSearchPage from './pages/mail-search.page'
import { SearchParserResult } from '../../types/search-parser'

@Injectable()
export class MailSearchParserService {
  private page: MailSearchPage

  constructor(private readonly browserService: BrowserService, private readonly configService: ConfigService) {}

  public async parse(keywords: string[], afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>) {
    await this.webdriverIOParser(keywords, afterParseKeywordCb)
    return true
  }

  private async webdriverIOParser(
    keywords: string[],
    afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>
  ) {
    await this.initWebdriverIO()

    for (const keyword of keywords) {
      try {
        const result = await this.parseKeyword(keyword)
        if (afterParseKeywordCb) {
          await afterParseKeywordCb(result)
        }
      } catch (e) {
        //console.error(e)
        continue
      }
    }

    await sleep(200)
    await this.page.deleteSession()

    return true
  }

  private async initWebdriverIO() {
    const headlessConf = this.configService.get<number>('browser.headless')
    const browser = await this.browserService.initBrowser(Number(headlessConf) === 1)
    this.page = new MailRuSearchPage(browser)
  }

  private async parseKeyword(keyword: string): Promise<SearchParserResult | null> {
    const startPage = Number(this.configService.get<number>('mailSearch.startPage'))
    const lastPage = Number(this.configService.get<number>('mailSearch.lastPage'))

    await this.page.openUrl(`https://go.mail.ru/search?q=${keyword}`)
    await this.page.waitYandexFrame()

    const urls: string[] = []
    for (let i = 1; i <= lastPage; i++) {
      if (i >= startPage) {
        const result = await this.page.getSearchResultUrls(keyword)
        if (result) {
          result.urls.forEach((url) => urls.push(url))
        } else {
          continue
        }
      }
      if (lastPage > 1) {
        await this.page.toNextPage()
      }
    }

    return { keyword, urls }
  }
}
