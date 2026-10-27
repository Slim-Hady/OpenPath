import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SendGuideMessageSchema, type SendGuideMessage } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { GuideService } from './guide.service';

@Controller('guide')
@Roles('DEVELOPER')
export class GuideController {
  constructor(private readonly guide: GuideService) {}

  @Get('conversations/:issueId')
  conversation(@CurrentUser() user: RequestUser, @Param('issueId') issueId: string) {
    return this.guide.conversation(user.id, decodeURIComponent(issueId));
  }

  @Post('conversations/:issueId/messages')
  send(
    @CurrentUser() user: RequestUser,
    @Param('issueId') issueId: string,
    @Body() body: unknown,
  ) {
    const input: SendGuideMessage = SendGuideMessageSchema.parse(body);
    return this.guide.send(user.id, decodeURIComponent(issueId), input.content);
  }
}
