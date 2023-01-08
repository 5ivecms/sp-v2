import { resolve } from 'path'
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

  async getSearchResultUrls(keyword: string): Promise<SearchParserResult | null> {
    try {
      await this.browser.switchToFrame(null)
      await this.browser.$('body #grid .yandex-frame').waitForExist({ timeout: 5000, interval: 500 })
      const yandexFrame = await this.browser.$('body #grid .yandex-frame')
      await this.browser.switchToFrame(yandexFrame)

      await this.waitLoad('.content__left .serp-list')

      const serpItems = await this.browser.$$(
        '.content__left .serp-list .serp-item:not([data-fast-name="video-unisearch"]) .OrganicTitle .OrganicTitle-Link'
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
      await this.browser.switchToParentFrame()
      return null
    }
  }

  async toNextPage(): Promise<boolean> {
    await this.browser.switchToFrame(null)
    const yandexFrame = await this.browser.$('.yandex-frame')
    await this.browser.switchToFrame(yandexFrame)

    await this.waitLoad('.serp-list')
    await this.waitLoad('.pager__items')

    const pages = await this.browser.$$('.pager__items .pager__item')
    const lastPage = pages[pages.length - 1]
    const lastPageText = await lastPage.getText()

    if (lastPageText.trim() === 'дальше') {
      await lastPage.click()
      return true
    }

    return false
  }

  async switchToYandexFrame() {
    return new Promise(async (resolve, reject) => {
      try {
        const yandexFrame = await this.browser.$('.yandex-frame')
        await this.browser.switchToFrame(yandexFrame)
        resolve(true)
      } catch (e) {
        reject(e)
      }
    })
  }

  async waitYandexFrame() {
    await this.browser.$('.yandex-frame').waitForExist({ timeout: 5000, interval: 500 })
  }

  async waitLoad(selector: string) {
    let isLoaded = false
    const tryCount = 5
    let count = 0

    while (!isLoaded || count < tryCount) {
      try {
        const result = await this.browser.$(selector).waitForExist({ timeout: 5000 })
        if (result === true) {
          isLoaded = true
          break
        }
      } catch {}
      count++
    }

    return isLoaded
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
