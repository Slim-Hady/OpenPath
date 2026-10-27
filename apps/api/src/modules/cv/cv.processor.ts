import { Injectable } from '@nestjs/common';
import { CvService } from './cv.service';

@Injectable()
export class CvProcessor {
  constructor(private readonly cv: CvService) {}

  async handle(fileId: string): Promise<void> {
    await this.cv.process(fileId);
  }
}
