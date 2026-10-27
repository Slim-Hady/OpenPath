import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ConnectGithubSchema, type ConnectGithub } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @Get('status')
  status(@CurrentUser() user: RequestUser) {
    return this.github.status(user.id);
  }

  @Post('connect')
  connect(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: ConnectGithub = ConnectGithubSchema.parse(body);
    return this.github.connect(user.id, input.providerToken);
  }

  @Delete()
  async disconnect(@CurrentUser() user: RequestUser) {
    await this.github.disconnect(user.id);
    return { ok: true as const };
  }
}
