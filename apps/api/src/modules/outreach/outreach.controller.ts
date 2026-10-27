import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateOutreachSchema,
  RespondOutreachSchema,
  SendOutreachMessageSchema,
  type CreateOutreach,
  type RespondOutreach,
  type SendOutreachMessage,
} from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { OutreachService } from './outreach.service';

@Controller('outreach')
@Roles('DEVELOPER', 'MAINTAINER')
export class OutreachController {
  constructor(private readonly outreach: OutreachService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: CreateOutreach = CreateOutreachSchema.parse(body);
    return this.outreach.create(user.id, input);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.outreach.list(user.id);
  }

  @Patch(':id')
  respond(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: unknown) {
    const input: RespondOutreach = RespondOutreachSchema.parse(body);
    return this.outreach.respond(user.id, id, input);
  }

  @Get(':id/conversation')
  conversation(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.outreach.conversation(user.id, id);
  }

  @Post(':id/conversation/messages')
  send(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input: SendOutreachMessage = SendOutreachMessageSchema.parse(body);
    return this.outreach.sendMessage(user.id, id, input.body);
  }
}
