import { Module } from '@nestjs/common';
import { CvModule } from '../modules/cv/cv.module';
import { AchievementsModule } from '../modules/achievements/achievements.module';
import { AdminModule } from '../modules/admin/admin.module';
import { SyncService } from './sync.service';
import { SchedulerService } from './scheduler.service';
import { WorkerRunner } from './worker-runner';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Module({
  imports: [CvModule, AchievementsModule, AdminModule, NotificationsModule],
  providers: [SyncService, SchedulerService, WorkerRunner],
  exports: [SyncService, SchedulerService, WorkerRunner],
})
export class JobsModule {}
