import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SiteService {
  private readonly domain: string = 'https://dokohranatruda.ru';
  private readonly login: string = 'admin';
  private readonly password: string = 'p3fDFc4klNjBg7UIM7';

  public async auth() {
    const data = {
      username: this.login,
      password: this.password,
    };

    const headers = {
      'Content-Type': 'application/json',
      Referer: 'http://articlewp-panel.local:81',
    };

    try {
      const result = await axios.post(
        `${this.domain}/wp-json/api-bearer-auth/v1/login`,
        data,
        {
          headers: headers,
          timeout: 50000,
        },
      );
      return result.data.access_token;
    } catch {
      return false;
    }
  }

  public async getKeyword(access_token: string) {
    try {
      const result = await axios.get(
        `${this.domain}/wp-json/article-parser/v1/get-keyword`,
        {
          headers: {
            Authorization: 'Bearer ' + access_token,
            Referer: 'http://articlewp-panel.local:81',
          },
          timeout: 50000,
        },
      );

      return result.data;
    } catch {
      return false;
    }
  }

  public async getKeywords(access_token: string, limit: number) {
    try {
      const result = await axios.get(
        `${this.domain}/wp-json/article-parser/v1/keywords?limit=${limit}`,
        {
          headers: {
            Authorization: 'Bearer ' + access_token,
            Referer: 'http://articlewp-panel.local:81',
          },
          timeout: 50000,
        },
      );
      return result.data;
    } catch {
      return false;
    }
  }

  public async saveArticle(
    articleContent: any,
    keyword: any,
    access_token: string,
  ) {
    const data = {
      keyword: keyword,
      article: articleContent.article,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token,
      Referer: 'http://articlewp-panel.local:81',
    };

    try {
      const result = await axios.post(
        `${this.domain}/wp-json/article-parser/v1/save-article`,
        data,
        {
          headers: headers,
          timeout: 50000,
        },
      );
      return result.data;
    } catch {
      return false;
    }
  }

  public async saveArticles(access_token: string, data: any) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token,
      Referer: 'http://articlewp-panel.local:81',
    };

    try {
      const result = await axios.post(
        `${this.domain}/wp-json/article-parser/v1/save-articles`,
        data,
        {
          headers: headers,
          timeout: 50000,
        },
      );
      return result.data;
    } catch {
      return false;
    }
  }
}
