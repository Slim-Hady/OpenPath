import { Module } from '@nestjs/common';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { SelectionModule } from '../selection/selection.module';
import { ProfileModule } from '../profile/profile.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SelectionModule, ProfileModule, NotificationsModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
