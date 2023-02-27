import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { remove } from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import { sleep } from '../../utils'
import { BrowserService } from '../browser/browser.service'
import MailRuSearchPage from './pages/mail-search.page'
import { SearchParserResult } from '../../types/search-parser'
import { XEvilService } from '../xevil/xevil.service'
import { path } from 'app-root-path'

@Injectable()
export class MailSearchParserService {
  private page: MailRuSearchPage

  constructor(
    private readonly browserService: BrowserService,
    private readonly configService: ConfigService,
    private readonly xevilService: XEvilService
  ) {}

  public async parse(keywords: string[], afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>) {
    await this.parseKeywords(keywords, afterParseKeywordCb)
    return true
  }

  private async parseKeywords(keywords: string[], afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>) {
    await this.init()

    for (const keyword of keywords) {
      try {
        const result = await this.parseKeyword(keyword)
        if (afterParseKeywordCb) {
          await afterParseKeywordCb(result)
        }
      } catch (e) {
        continue
      }
    }

    await sleep(200)
    await this.page.deleteSession()

    return true
  }

  private async init() {
    const headlessConf = this.configService.get<number>('browser.headless')
    const browser = await this.browserService.initBrowser(Number(headlessConf) === 1)
    this.page = new MailRuSearchPage(browser)
  }

  private async parseKeyword(keyword: string): Promise<SearchParserResult | null> {
    const url = `https://go.mail.ru/search?q=${keyword}`
    await this.page.openUrl(`https://go.mail.ru/search?q=${keyword}`)

    await this.page.switchToYandexFrame()
    await this.recognizeCaptcha(url)

    const urls: string[] = []
    const result = await this.page.getSearchResultUrls(keyword)
    if (result) {
      result.urls.forEach((url) => urls.push(url))
    }
    //console.log(urls)

    return { keyword, urls }
  }

  private async recognizeCaptcha(currentUrl: string) {
    let hasSearchResults = await this.page.hasSearchResults()
    //console.log(`Поток ${threadId}: нет результатов поиска`)
    if (hasSearchResults) {
      return
    }

    const hasCheckboxCaptcha = await this.page.hasCheckboxCaptcha()
    if (hasCheckboxCaptcha) {
      //console.log(`Поток ${threadId}: есть чекбокс капча `)
      await this.page.clickToCheckboxCaptcha()
      //await sleep(5000)
    }

    hasSearchResults = await this.page.hasSearchResults()
    if (hasSearchResults) {
      //console.log(`Поток ${threadId}: прошли капчу`)
      return
    }

    const hasSmartCaptcha = await this.page.hasSmartCaptcha()
    if (hasSmartCaptcha) {
      const captchaFilePath = this.getCaptchaFilePath()
      const isSaved = await this.page.saveSmartCaptchaImage(captchaFilePath)

      if (isSaved) {
        let textResult: string | false = ''
        textResult = await this.xevilService.imageFromFileToText(captchaFilePath)

        if (textResult && textResult.length) {
          await this.page.submitImageCaptcha(textResult)
          await remove(captchaFilePath)
        }
      }
      await sleep(2000)
    }

    await this.recognizeCaptcha(currentUrl)
  }

  private getCaptchaFilePath() {
    const captchaFolderPath = `${path}/captcha`
    const captchaFilePath = `${captchaFolderPath}/${uuidv4()}.png`
    return captchaFilePath
  }
}
