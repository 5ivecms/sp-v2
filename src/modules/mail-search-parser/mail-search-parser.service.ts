import { Injectable } from '@nestjs/common'
import { sleep } from '../../utils'
import { BrowserService } from '../browser/browser.service'
import { MailSearchPage } from './mail-search.interfaces'
import MailRuSearchPage from './pages/mail-search.page'
import { SearchParserResult } from '../../types/search-parser'

@Injectable()
export class MailSearchParserService {
  private page: MailSearchPage

  constructor(private readonly browserService: BrowserService) {}

  public async parse(keywords: string[], afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>) {
    await this.webdriverIOParser(keywords, afterParseKeywordCb)
    return true
  }

  private async webdriverIOParser(
    keywords: string[],
    afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>
  ) {
    await this.initWebdriverIO()
    //const result = await this.parseKeyword(keywords[0])
    for (const keyword of keywords) {
      try {
        const result = await this.parseKeyword(keyword)
        if (afterParseKeywordCb) {
          await afterParseKeywordCb(result)
        }
      } catch (e) {
        console.log(e)
        continue
      }
    }
    await sleep(200)
    await this.page.deleteSession()
    return true
  }

  private async initWebdriverIO() {
    const browser = await this.browserService.initBrowser()
    this.page = new MailRuSearchPage(browser)
  }

  private async parseKeyword(keyword: string): Promise<SearchParserResult | null> {
    await this.page.openUrl(`https://go.mail.ru/search?q=${keyword}`)
    await this.page.jsPlaceholder.waitForExist({ timeout: 60000, interval: 500, reverse: true })
    return await this.page.getSearchResultUrls(keyword)
  }
}
