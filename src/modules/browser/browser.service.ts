import { Injectable } from '@nestjs/common'
import { remote } from 'webdriverio'

@Injectable()
export class BrowserService {
  public async initBrowser() {
    return await remote({
      reporters: ['dot'],
      waitforTimeout: 60000,
      logLevel: 'silent',
      capabilities: {
        browserName: 'chrome',
        maxInstances: 10,
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
          //args: ['--disable-application-cache', '--log-level=3', '--disable-logging'],
          args: [
            '--disable-application-cache',
            '--log-level=3',
            '--disable-logging',
            '--headless',
            //'--disable-gpu',
            '--no-sandbox',
          ],
          //args: ['--disable-application-cache', '--log-level=3', '--disable-logging', '--incognito'],
        },
      },
    })
  }
}
