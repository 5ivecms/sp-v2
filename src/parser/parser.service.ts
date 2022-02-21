import { Injectable } from '@nestjs/common';

@Injectable()
export class ParserService {
  constructor() {}

  public test(): string {
    return 'ok11';
  }
}
