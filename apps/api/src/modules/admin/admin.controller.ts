import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { z } from 'zod';
import {
  AiFeatureSchema,
  UpdateAiSettingsSchema,
  type UpdateAiSettings,
} from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { AppError } from '../../common/errors';
import { AdminService } from './admin.service';

const PeriodSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  feature: AiFeatureSchema.optional(),
});

@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metrics')
  metrics(@Query() query: unknown) {
    const period = PeriodSchema.parse(query ?? {});
    return this.admin.metrics(
      period.start ? new Date(period.start) : undefined,
      period.end ? new Date(period.end) : undefined,
    );
  }

  @Get('users')
  users() {
    return this.admin.users();
  }

  @Get('ai-settings')
  settings() {
    return this.admin.aiSettingsGet();
  }

  @Put('ai-settings')
  updateSettings(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: UpdateAiSettings = UpdateAiSettingsSchema.parse(body);
    return this.admin.aiSettingsUpdate(input, user.id);
  }

  @Get('ai-settings/usage')
  settingsAgainstUsage() {
    return this.admin.settingsAgainstUsage();
  }

  @Get('ai-usage')
  aiUsage(@Query() query: unknown) {
    const parsed = PeriodSchema.parse(query ?? {});
    const end = parsed.end ? new Date(parsed.end) : new Date();
    const start = parsed.start ? new Date(parsed.start) : new Date(end.getTime() - 30 * 86_400_000);
    if (start > end) throw new AppError('INVALID_PERIOD', 'The period start must be before the end', 400);
    if (end.getTime() - start.getTime() > 366 * 86_400_000) {
      throw new AppError('INVALID_PERIOD', 'The period is limited to one year', 400);
    }
    return this.admin.usage(start, end, parsed.feature);
  }
}
