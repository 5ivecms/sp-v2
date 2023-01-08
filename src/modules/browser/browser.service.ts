import { Injectable } from '@nestjs/common'
import { remote } from 'webdriverio'

@Injectable()
export class BrowserService {
  constructor() {}

  public async initBrowser(headless: boolean) {
    const args: string[] = [
      '--disable-extensions',
      '--disable-application-cache',
      '--log-level=3',
      '--disable-logging',
      '--no-sandbox',
      //'--disable-gpu',
    ]

    if (headless) {
      args.push('--headless')
    }

    const browser = await remote({
      reporters: ['dot'],
      logLevel: 'silent',
      capabilities: {
        browserName: 'chrome',
        maxInstances: 10,
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
          args: args,
          //args: ['--disable-application-cache', '--log-level=3', '--disable-logging'],
          //args: ['--disable-application-cache', '--log-level=3', '--disable-logging', '--incognito'],
        },
      },
    })

    await browser.setTimeout({ pageLoad: 2000 })

    return browser
  }
}
