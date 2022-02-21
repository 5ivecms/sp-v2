import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ContentApiService {
  private readonly HOST: string =
    'https://articleapi.ru/api/v1/generate-article-by-links';

  public async generateArticleByUrls(urls: any): Promise<any> {
    try {
      const result = await axios.post(this.HOST, urls, {
        timeout: 50000,
      });
      //console.log(result.data);
      return result.data;
    } catch {
      return false;
    }
  }
}
