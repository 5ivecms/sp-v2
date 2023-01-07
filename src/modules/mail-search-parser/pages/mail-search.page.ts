import { ChainablePromiseElement } from 'webdriverio'
import { SearchParserResult } from '../../../types/search-parser'
import { MailSearchPage } from '../mail-search.interfaces'
import BasePage from './base.page'

export default class MailRuSearchPage extends BasePage implements MailSearchPage {
  get jsPlaceholder(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('#js-preloader')
  }

  get captchaBlock(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('.DesktopCaptcha-captchaBlock')
  }

  get captchaImg(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('img.DesktopCaptcha-captchaImage')
  }

  get captchaField(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('input.DesktopCaptcha-captchaInput')
  }

  get captchaButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('form.DesktopCaptcha-captchaForm button[type="submit"]')
  }

  async hasCaptcha(): Promise<boolean> {
    return await this.captchaImg.isExisting()
  }

  async submitCaptcha(): Promise<void> {
    await this.captchaButton.click()
  }

  async getCaptchaInfo() {
    return {
      x: await this.captchaImg.getLocation('x'),
      y: await this.captchaImg.getLocation('y'),
      width: await this.captchaImg.getSize('width'),
      height: await this.captchaImg.getSize('height'),
    }
  }

  async getSearchResultUrls(): Promise<SearchParserResult | null> {
    try {
      await this.browser.$('body #grid .yandex-frame').waitForExist({ timeout: 60000, interval: 500 })

      const yandexFrame = await this.browser.$('body #grid .yandex-frame')
      await this.browser.switchToFrame(yandexFrame)
      await this.browser.$('.search2 .search2__input .input__box input').waitForExist({ timeout: 60000, interval: 500 })

      const searchInput = await this.browser.$('.search2 .search2__input .input__box input')
      const keyword = await searchInput.getAttribute('value')

      const serpItems = await this.browser.$$(
        '.content__left .serp-list .serp-item :not([data-fast-name="video-unisearch"]) .OrganicTitle .OrganicTitle-Link'
      )

      let urls: string[] = []
      for (const serpItem of serpItems) {
        const url = await serpItem.getAttribute('href')
        urls.push(url)
      }
      urls = urls.filter((url) => url.indexOf('yabs.yandex') === -1)

      await this.browser.switchToParentFrame()

      return { keyword, urls }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async open(): Promise<void> {
    await super.open('https://go.mail.ru/')
  }

  async close(): Promise<void> {
    await super.closeWindow()
  }

  async deleteSession() {
    await super.deleteSession()
  }

  async reloadSession() {
    await super.reloadSession()
  }

  async openUrl(url: string): Promise<void> {
    await super.open(url)
  }
}
