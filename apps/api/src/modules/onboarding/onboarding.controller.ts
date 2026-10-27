import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
@Roles('DEVELOPER')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get('repository/:issueId')
  repository(@CurrentUser() user: RequestUser, @Param('issueId') issueId: string) {
    return this.onboarding.repository(user.id, decodeURIComponent(issueId));
  }

  @Get('issue/:issueId')
  issue(@CurrentUser() user: RequestUser, @Param('issueId') issueId: string) {
    return this.onboarding.issueOnboarding(user.id, decodeURIComponent(issueId));
  }
}
