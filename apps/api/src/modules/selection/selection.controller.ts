import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  SelectIssueSchema,
  UpdateProgressSchema,
  type SelectIssue,
  type UpdateProgress,
} from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { SelectionService } from './selection.service';
import { QueueService, QUEUES } from '../../infra/queue.service';

@Controller()
export class SelectionController {
  constructor(
    private readonly selection: SelectionService,
    private readonly queue: QueueService,
  ) {}

  @Post('selection')
  @Roles('DEVELOPER')
  select(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: SelectIssue = SelectIssueSchema.parse(body);
    return this.selection.select(user.id, input);
  }

  @Get('selection/active')
  @Roles('DEVELOPER')
  active(@CurrentUser() user: RequestUser) {
    return this.selection.active(user.id);
  }

  @Get('progress')
  @Roles('DEVELOPER')
  progress(@CurrentUser() user: RequestUser) {
    return this.selection.progress(user.id);
  }

  @Post('progress/sync')
  @Roles('DEVELOPER')
  async sync(@CurrentUser() user: RequestUser) {
    await this.queue.addOrFail(QUEUES.syncProgress, { userId: user.id }, `sync-manual:${user.id}:${Date.now()}`);
    return { ok: true as const };
  }

  @Get('progress/:id/history')
  @Roles('DEVELOPER')
  history(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.selection.history(user.id, id);
  }

  @Patch('progress/:id')
  @Roles('DEVELOPER')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: unknown) {
    const input: UpdateProgress = UpdateProgressSchema.parse(body);
    return this.selection.update(user.id, id, input);
  }
}
