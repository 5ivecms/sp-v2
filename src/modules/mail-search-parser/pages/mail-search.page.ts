import { ChainablePromiseElement } from 'webdriverio'
import { SearchParserResult } from '../../../types/search-parser'
import BasePage from './base.page'

export default class MailRuSearchPage extends BasePage {
  get jsPlaceholder(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('#js-preloader')
  }

  async switchToYandexFrame() {
    await this.browser.$('body #grid .yandex-frame').waitForExist({ timeout: 5000 })
    const yandexFrame = await this.browser.$('body #grid .yandex-frame')
    await this.browser.switchToFrame(yandexFrame)
  }

  async hasSearchResults() {
    try {
      const isExist = await this.browser.$('.content__left .serp-list').waitForExist({ timeout: 5000 })

      if (isExist === true) {
        return true
      }

      return false
    } catch (e) {
      //console.log(e)
    }
    return false
  }

  async hasCheckboxCaptcha() {
    try {
      const hasCaptcha = await this.browser.$('.CheckboxCaptcha').waitForExist({
        timeout: 5000,
      })

      if (hasCaptcha === true) {
        return true
      }
    } catch (e) {
      //console.error('Капчи нет или возникла ошибка')
      return null
    }

    return false
  }

  async clickToCheckboxCaptcha() {
    try {
      await this.browser.$('.CheckboxCaptcha-Button').waitForExist({ timeout: 5000 })
      await this.browser.$('.CheckboxCaptcha').waitForExist({
        timeout: 5000,
      })
      await this.browser.$('.CheckboxCaptcha-Button').click()
    } catch {
      //console.error('Ошибка при клике по чекбокс капче')
    }
  }

  async hasSmartCaptcha() {
    try {
      const hasCaptcha = await this.browser.$('.AdvancedCaptcha-Image').waitForExist({
        timeout: 5000,
      })

      if (hasCaptcha === true) {
        //console.log(`Есть смарт капча`)
        return true
      }
    } catch {
      //console.error('Смарт капчи нет или возникла ошибка')
      return null
    }

    return false
  }

  async saveSmartCaptchaImage(path: string) {
    try {
      await this.browser.$('.AdvancedCaptcha-Image').waitForExist({ timeout: 5000 })
      await this.browser.$('.AdvancedCaptcha-Image').saveScreenshot(path)
      return true
    } catch {
      //console.log('Ошибка при сохранении изображения капчи')
      return false
    }
  }

  async submitImageCaptcha(value: string) {
    await this.browser.$('.Textinput-Control[name="rep"]').waitForExist({ timeout: 5000 })
    await this.browser.$('.CaptchaButton[type="submit"]').waitForExist({ timeout: 5000 })
    await this.browser.$('.Textinput-Control[name="rep"]').setValue(value)
    await this.browser.$('.CaptchaButton[type="submit"]').click()
  }

  async getSearchResultUrls(keyword: string): Promise<SearchParserResult | null> {
    try {
      await this.browser.$('.content__left .serp-list').waitForExist({ timeout: 5000 })

      const serpItems = await this.browser.$$(
        '.content__left .serp-list .serp-item:not([data-fast-name="video-unisearch"]) .OrganicTitle .OrganicTitle-Link'
      )

      let urls: string[] = []
      for (const serpItem of serpItems) {
        const url = await serpItem.getAttribute('href')
        urls.push(url)
      }
      urls = urls.filter((url) => url.indexOf('yabs.yandex') === -1)

      return { keyword, urls }
    } catch (e) {
      //console.log(e)
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
