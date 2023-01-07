import { Injectable } from '@nestjs/common'
import { multiremote, remote, RemoteOptions } from 'webdriverio'

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
          args: ['--disable-application-cache', '--log-level=3', '--disable-logging', '--headless'],
          //args: ['--disable-application-cache', '--log-level=3', '--disable-logging', '--incognito'],
        },
      },
    })
  }

  public async multiRemote(countBrowsers: number = 1) {
    const params = {}
    const options: RemoteOptions = {
      logLevel: 'silent',
      capabilities: {
        browserName: 'chrome',
        maxInstances: 10,
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
          args: ['--disable-application-cache', '--log-level=3', '--disable-logging', '--headless'],
        },
      },
    }

    for (let i = 0; i < countBrowsers; i++) {
      params[`browser${i}`] = options
    }

    //const browser1 = browser['browser1'] as WebdriverIO.Browser
    //const browser2 = browser['browser2'] as WebdriverIO.Browser

    return await multiremote(params)
  }
}
