import { Controller, Get } from '@nestjs/common';
import { remote } from 'webdriverio';
import MailRuSearchPage from './pages/mailRuSearch.page';
import { CaptchaService } from '../captcha/captcha.service';
import { ContentApiService } from '../content-api/content-api.service';
import { SiteService } from '../site/site.service';

@Controller('parser')
export class ParserController {
  private readonly keywordsLimit: number = 20000;

  private browser: WebdriverIO.Browser;
  private mailPage: any;

  constructor(
    private readonly catchaService: CaptchaService,
    private readonly contentApiService: ContentApiService,
    private readonly siteService: SiteService,
  ) {}

  @Get('test')
  public async test() {
    const access_token = await this.siteService.auth();

    const path = require('path');
    const mkdirp = require('mkdirp');
    const fs = require('fs');
    const screenshotsFolder = path.resolve(__dirname) + '/screenshots/';

    fs.stat(screenshotsFolder, function (err: any) {
      if (err) {
        mkdirp(screenshotsFolder);
      }
    });

    await this.initBrowser();

    for (const item of Array(this.keywordsLimit)) {
      const result = [];

      const keywords = await this.siteService.getKeywords(access_token, 40);
      if (!keywords.length) {
        console.log('нет ключей');
        break;
      }

      for (const keyword of keywords) {
        await this.mailPage.openUrl(
          `https://go.mail.ru/search?q=${keyword.keyword}`,
        );
        await this.recognizeCaptcha();
        await this.sleep(200);
        const searchResults = await this.mailPage.getSearchResultUrls();
        if (!searchResults.length) {
        }

        result.push({ keyword, links: searchResults });
      }

      await this.saveArticles(access_token, result);
      await this.browser.reloadSession();
    }
  }

  public async initBrowser() {
    const browser: WebdriverIO.Browser = await remote({
      reporters: ['dot'],
      logLevel: 'silent',
      capabilities: {
        browserName: 'chrome',
        maxInstances: 10,
        acceptInsecureCerts: true,

        'goog:chromeOptions': {
          args: [
            '--disable-application-cache',
            '--log-level=3',
            '--disable-logging',
            '--incognito',
            '--disable-extensions',
            'test-type',
            '--silent',
            '--disable-infobars',
            '--no-sandbox',
            '--disable-dev-tools',
            'disable-dev-tools',
          ],
        },
      },
    });
    this.browser = browser;

    const mailRuSearchPage = new MailRuSearchPage(browser);
    this.mailPage = mailRuSearchPage;
  }

  public async parse(keyword: string) {
    await this.mailPage.searchField.clearValue();
    await this.mailPage.searchField.setValue('');
    await this.sleep(500);
    await this.mailPage.searchField.setValue(keyword);
    await this.sleep(500);
    await this.mailPage.searchField.clearValue();
    await this.mailPage.searchField.setValue(keyword);
    await this.mailPage.search();

    await this.mailPage.jsPlaceholder.waitForExist({
      timeout: 5000,
      interval: 500,
      reverse: true,
    });

    await this.sleep(500);
    await this.recognizeCaptcha();

    const urls = await this.mailPage.getSearchResultUrls();
    if (!urls.length) {
      return false;
    }

    return urls;
  }

  public async recognizeCaptcha() {
    let hasCaptcha = false;
    try {
      hasCaptcha = await this.mailPage.captchaBlock.waitForExist({
        timeout: 2000,
        reverse: false,
      });
    } catch {}

    if (!hasCaptcha) {
      return true;
    }

    const path = require('path');
    const screenshotsFolder = path.resolve(__dirname) + '/screenshots/';
    const screenshotPath = `${screenshotsFolder}${this.uid()}.png`;

    await this.browser.saveScreenshot(screenshotPath);

    try {
      const captchaInfo = await this.mailPage.getCaptchaInfo();
      const catpachaFile = await this.saveCaptchaFile(
        screenshotPath,
        captchaInfo,
      );

      const captchaSrc = await this.mailPage.captchaImg.getAttribute('src');

      if (catpachaFile !== false) {
        const captchaResult = await this.catchaService.recognize(catpachaFile);
        await this.mailPage.captchaField.setValue(captchaResult);
        await this.mailPage.submitCaptcha();
        await this.mailPage.captchaImg.waitUntil(
          async function () {
            return (await this.getAttribute('src')) !== captchaSrc;
          },
          {
            timeout: 5000,
            timeoutMsg: 'expected text to be different after 5s',
          },
        );
      }
      await this.recognizeCaptcha();
    } catch {
      return true;
    }
  }

  private async saveCaptchaFile(screenshotPath: string, captchaInfo: any) {
    const sharp = require('sharp');
    const captchaFileName = `captcha-${this.uid()}.png`;
    const captchaPath = 'D:/OpenServer/domains/captcha2.local/';

    try {
      await sharp(screenshotPath)
        .extract({
          width: captchaInfo.width,
          height: captchaInfo.height,
          left: captchaInfo.x,
          top: captchaInfo.y,
        })
        .toFile(`${captchaPath}${captchaFileName}`);
      return `${captchaFileName}`;
    } catch {
      return false;
    }
  }

  private async saveArticles(access_token, data): Promise<any> {
    const requests = data.map((item) =>
      this.contentApiService.generateArticleByUrls(item),
    );
    await Promise.all(requests).then(async (responses) => {
      await this.siteService.saveArticles(access_token, responses);
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
