/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { Command } from 'nestjs-command'
import { millisToMinutesAndSeconds } from '../../utils'
import { WordpressService } from './wordpress.service'

@Injectable()
export class WordpressCommand {
  constructor(private readonly wordpressService: WordpressService) {}

  @Command({
    command: 'wordpress:parse',
    describe: 'parse articles',
  })
  public async parseArticles() {
    console.log('Парсинг запущен')
    const start = new Date().getTime()
    try {
      await this.wordpressService.parseArticles()
      const end = new Date().getTime()
      const time = end - start
      console.log(`Парсинг завершен: ${millisToMinutesAndSeconds(time)}`)
    } catch (e) {
      const end = new Date().getTime()
      const time = end - start
      console.log(e)
      console.log(`Парсинг завершен: ${millisToMinutesAndSeconds(time)}`)
    }
  }
}
