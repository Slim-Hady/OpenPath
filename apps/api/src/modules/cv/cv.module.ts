import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvProcessor } from './cv.processor';

@Module({
  controllers: [CvController],
  providers: [CvService, CvProcessor],
  exports: [CvProcessor],
})
export class CvModule {}
