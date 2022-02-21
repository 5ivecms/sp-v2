import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  private readonly CAPTCHA_SERVER: string =
    'http://captcha2.local:82/recognize.php';

  public async recognize(filaname: string): Promise<string> {
    const result = await axios.get(
      `${this.CAPTCHA_SERVER}?captchaName=${filaname}`,
    );

    return result.data;
  }
}
