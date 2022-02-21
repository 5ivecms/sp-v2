import { ChainablePromiseElement } from 'webdriverio';
import BasePage from './base.page';

export default class MailRuSearchPage extends BasePage {
  get jsPlaceholder(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('#js-preloader');
  }

  get submitButton(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('.DesktopHeaderField-submitButton[type="submit"]');
  }

  get searchField(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('.DesktopInput-input[name="q"]');
  }

  get searchResult(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('#js-result');
  }

  get captchaBlock(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('.DesktopCaptcha-captchaBlock');
  }

  get captchaImg(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('img.DesktopCaptcha-captchaImage');
  }

  get captchaField(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$('input.DesktopCaptcha-captchaInput');
  }

  get captchaButton(): ChainablePromiseElement<Promise<WebdriverIO.Element>> {
    return this.browser.$(
      'form.DesktopCaptcha-captchaForm button[type="submit"]',
    );
  }

  async hasCaptcha(): Promise<boolean> {
    return await this.captchaImg.isExisting();
  }

  async submitCaptcha(): Promise<void> {
    await this.captchaButton.click();
  }

  async search(): Promise<void> {
    await this.submitButton.click();
  }

  async getCaptchaInfo() {
    return {
      x: await this.captchaImg.getLocation('x'),
      y: await this.captchaImg.getLocation('y'),
      width: await this.captchaImg.getSize('width'),
      height: await this.captchaImg.getSize('height'),
    };
  }

  async getSearchResultUrls() {
    const result = await this.browser.$$(
      '.App-results .App-result .js-snippet-container .SnippetResultTitle-title a',
    );

    const urls = [];
    for (const item of result) {
      const href = await item.getAttribute('href');
      urls.push(href);
    }

    return urls;
  }

  async open(): Promise<void> {
    await super.open('https://go.mail.ru/');
  }

  async close(): Promise<void> {
    await super.closeWindow();
  }

  async openUrl(url: string): Promise<void> {
    await super.open(url);
  }
}
