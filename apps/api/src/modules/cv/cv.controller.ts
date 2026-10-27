import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { CvFile } from '@osh/contracts';
import { CV_MAX_BYTES } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
  constructor(private readonly cv: CvService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: CV_MAX_BYTES + 1024 },
      storage: undefined,
    }),
  )
  async upload(
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ file: CvFile }> {
    return { file: await this.cv.upload(user.id, file) };
  }

  @Get()
  async latest(@CurrentUser() user: RequestUser): Promise<{ file: CvFile | null }> {
    return { file: await this.cv.latest(user.id) };
  }

  @Post(':id/retry')
  async retry(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<{ file: CvFile }> {
    return { file: await this.cv.retry(user.id, id) };
  }
}
