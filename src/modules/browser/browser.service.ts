import { Injectable } from '@nestjs/common'
import { ensureDir } from 'fs-extra'
import { path } from 'app-root-path'
import { remote } from 'webdriverio'
import { threadId } from 'worker_threads'

@Injectable()
export class BrowserService {
  constructor() {}

  public async initBrowser(headless: boolean) {
    const chromeProfileFolder = `${path}/chromeProfiles/chromeProfile${threadId}`
    await ensureDir(chromeProfileFolder)
    await ensureDir(`${path}/captcha`)

    console.log('браузер', threadId)

    const args: string[] = [
      '--disable-extensions',
      '--disable-application-cache',
      '--log-level=3',
      '--disable-logging',
      '--no-sandbox',
      //'--disable-gpu',
      `--user-data-dir=${chromeProfileFolder}`,
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

    await browser.setTimeout({ pageLoad: 5000 })

    return browser
  }
}
