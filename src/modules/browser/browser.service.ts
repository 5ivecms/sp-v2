import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { remote } from 'webdriverio'

@Injectable()
export class BrowserService {
  constructor(private readonly configService: ConfigService) {}

  public async initBrowser() {
    const headlessConf = this.configService.get<number>('browser.headless')

    const args: string[] = [
      '--disable-application-cache',
      '--log-level=3',
      '--disable-logging',
      //'--disable-gpu',
      '--no-sandbox',
    ]

    if (Number(headlessConf) === 1) {
      args.push('--headless')
    }

    return await remote({
      reporters: ['dot'],
      waitforTimeout: 60000,
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
  }
}
