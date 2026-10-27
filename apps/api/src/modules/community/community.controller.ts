import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContributorSearchQuerySchema, type ContributorSearchQuery } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { GithubService } from '../github/github.service';

@Controller('community')
export class CommunityController {
  constructor(private readonly github: GithubService) {}

  @Get('contributors')
  @Roles('DEVELOPER', 'MAINTAINER')
  search(@CurrentUser() user: RequestUser, @Query() query: unknown) {
    const input: ContributorSearchQuery = ContributorSearchQuerySchema.parse(query ?? {});
    return this.github.searchContributors(user.id, input);
  }

  @Get('contributors/:login')
  @Roles('DEVELOPER', 'MAINTAINER')
  detail(@CurrentUser() user: RequestUser, @Param('login') login: string) {
    return this.github.contributorDetail(user.id, login);
  }
}
