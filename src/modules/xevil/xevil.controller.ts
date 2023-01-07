import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { XEvilService } from './xevil.service'

@Controller('api/xevil')
export class XEvilController {
  constructor(private readonly xevilService: XEvilService) {}

  @Post('image-file-to-text')
  @UseInterceptors(FileInterceptor('file'))
  public imageFileToText(@UploadedFile() file: Express.Multer.File) {
    return this.xevilService.imageFileToText(file)
  }
}
