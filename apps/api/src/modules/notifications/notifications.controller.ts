import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { PaginationQuerySchema, UpdateNotificationPreferencesSchema } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: unknown) {
    const { page, perPage } = PaginationQuerySchema.parse(query ?? {});
    return this.notifications.list(user.id, page, perPage);
  }

  @Get('preferences')
  preferences(@CurrentUser() user: RequestUser) {
    return this.notifications.preferences(user.id);
  }

  @Put('preferences')
  updatePreferences(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    return this.notifications.updatePreferences(
      user.id,
      UpdateNotificationPreferencesSchema.parse(body),
    );
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.notifications.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.notifications.markRead(user.id, id);
  }
}
