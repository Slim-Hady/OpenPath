import { Module } from '@nestjs/common';
import { SelectionController } from './selection.controller';
import { SelectionService } from './selection.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SelectionController],
  providers: [SelectionService],
  exports: [SelectionService],
})
export class SelectionModule {}
