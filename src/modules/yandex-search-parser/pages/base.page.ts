export default class BasePage {
  constructor(protected readonly browser: WebdriverIO.Browser) {}

  async open(path: string): Promise<void> {
    await this.browser.url(path)
  }

  async closeWindow() {
    await this.browser.closeWindow()
  }

  async deleteSession() {
    await this.browser.deleteSession()
  }

  async reloadSession() {
    await this.browser.reloadSession()
  }

  async newWindow(url: string) {
    await this.browser.newWindow(url)
  }

  public async saveScreenshot(filepath: string) {
    await this.browser.saveScreenshot(filepath)
  }
}
