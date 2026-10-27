import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UpdateBadgeVisibilitySchema } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
@Roles('DEVELOPER')
export class AchievementsController {
  constructor(private readonly achievements: AchievementsService) {}

  @Get()
  get(@CurrentUser() user: RequestUser) {
    return this.achievements.get(user.id);
  }

  @Patch('visibility')
  updateVisibility(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input = UpdateBadgeVisibilitySchema.parse(body);
    return this.achievements.updateVisibility(user.id, input.badgeCode, input.publicVisible);
  }
}
