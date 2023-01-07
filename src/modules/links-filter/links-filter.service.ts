import { Injectable } from '@nestjs/common'
import * as URLParse from 'url-parse'
import { getExtension } from '../../utils'
import { FilterDto } from './dto'
import { UrlParts } from './links-filter.types'
import { BAD_DOMAINS, BAD_EXTENSIONS } from './links-filter.constants'

@Injectable()
export class LinksFilterService {
  public filter(dto: FilterDto) {
    const { urls } = dto

    let newUrls = this.filterByEmptyPart(urls, 'pathname')
    newUrls = this.filterByEmptyPart(newUrls, 'host')
    newUrls = this.filterByEmptyPart(newUrls, 'hostname')
    newUrls = this.filterByExtensions(newUrls)
    newUrls = this.filterByDomain(newUrls)

    return newUrls
  }

  private filterByEmptyPart(urls: string[], part: UrlParts) {
    return urls.filter((url) => {
      const parsedUrl = URLParse(url)
      return parsedUrl[part] !== '/' && parsedUrl[part] !== ''
    })
  }

  private filterByExtensions(urls: string[]) {
    return urls.filter((url) => !BAD_EXTENSIONS.includes(getExtension(url)))
  }

  private filterByDomain(urls: string[]) {
    return urls.filter((url) => {
      const parsedUrl = URLParse(url)
      return !BAD_DOMAINS.includes(parsedUrl.host) && !BAD_DOMAINS.includes(parsedUrl.hostname)
    })
  }
}
