import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { path } from 'app-root-path'
import { SearchParserResult } from 'search-parser'
import { threadId } from 'worker_threads'
import { v4 as uuidv4 } from 'uuid'
import { readFile, remove } from 'fs-extra'
import axios from 'axios'
import { sleep } from '../../utils'
import { BrowserService } from '../browser/browser.service'
import YandexSearchPage from './pages/yandex-search.page'
import { XEvilService } from '../xevil/xevil.service'

@Injectable()
export class YandexSearchParserService {
  private page: YandexSearchPage

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
        //console.error(e)
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
    this.page = new YandexSearchPage(browser)
  }

  private async parseKeyword(keyword: string): Promise<SearchParserResult | null> {
    const startPage = Number(this.configService.get<number>('mailSearch.startPage'))
    const lastPage = Number(this.configService.get<number>('mailSearch.lastPage'))

    const urls: string[] = []
    for (let i = startPage; i <= lastPage; i++) {
      const currentUrl = `https://yandex.ru/search/?text=${keyword}&search_source=dzen_desktop_safe&p=${i - 1}`
      await this.page.openUrl(currentUrl)
      await this.recognizeCaptcha(currentUrl)

      const result = await this.page.getSearchResultUrls(keyword)
      if (result) {
        result.urls.forEach((url) => urls.push(url))
        console.log(`Ссылки получены threadId ${threadId}`)
      }

      if (lastPage > 1) {
        await this.page.toNextPage()
        await sleep(200)
      }
    }

    return { keyword, urls }
  }

  private async recognizeCaptcha(currentUrl: string) {
    const hasSearchResults = await this.page.hasSearchResults()
    if (hasSearchResults) {
      return
    }

    const hasCheckboxCaptcha = await this.page.hasCheckboxCaptcha()
    if (hasCheckboxCaptcha) {
      console.log(`Капча threadId ${threadId}`)
      await this.page.clickToCheckboxCaptcha()
    }

    const hasSmartCaptcha = await this.page.hasSmartCaptcha()
    if (hasSmartCaptcha) {
      const captchaFilePath = this.getCaptchaFilePath()
      const isSaved = await this.page.saveSmartCaptchaImage(captchaFilePath)

      if (isSaved) {
        const captchaService = this.configService.get<string>('captchaConfig.captchaService')

        let textResult: string | false = ''
        if (captchaService === 'local') {
          textResult = await this.xevilService.imageFromFileToText(captchaFilePath)
        } else {
          textResult = await this.solveRemote(captchaFilePath)
        }

        if (textResult && textResult.length) {
          await this.page.submitImageCaptcha(textResult)
          await remove(captchaFilePath)
        }
      }
      //await sleep(5000)
    }

    await this.recognizeCaptcha(currentUrl)
  }

  private getCaptchaFilePath() {
    const captchaFolderPath = `${path}/captcha`
    const captchaFilePath = `${captchaFolderPath}/${uuidv4()}.png`
    return captchaFilePath
  }

  private async solveRemote(captchaFilePath: string) {
    const captchaRemoteServiceUrl = this.configService.get<string>('captchaConfig.captchaRemoteServiceUrl')
    if (captchaRemoteServiceUrl === '') {
      return false
    }

    const imageBase64 = (await readFile(captchaFilePath)).toString('base64')

    try {
      const { data } = await axios.post<string | false>(
        captchaRemoteServiceUrl,
        { imageBase64 },
        { headers: { 'ngrok-skip-browser-warning': '1' } }
      )
      return data
    } catch {
      console.log('Ошибка при распознавании капчи удаленно')
      return false
    }
  }
}
