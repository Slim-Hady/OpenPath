import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { z } from 'zod';
import { UpdatePublicProfileSchema, type UpdatePublicProfile } from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Public, Roles } from '../../common/decorators';
import { PublicProfileService } from './public-profile.service';

const PublishSchema = z.object({ published: z.boolean() }).strict();

@Controller()
export class PublicProfileController {
  constructor(private readonly profiles: PublicProfileService) {}

  @Get('public-profile/settings')
  @Roles('DEVELOPER')
  settings(@CurrentUser() user: RequestUser) {
    return this.profiles.settings(user.id);
  }

  @Put('public-profile/settings')
  @Roles('DEVELOPER')
  update(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: UpdatePublicProfile = UpdatePublicProfileSchema.parse(body);
    return this.profiles.update(user.id, input);
  }

  @Post('public-profile/publish')
  @Roles('DEVELOPER')
  publish(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input = PublishSchema.parse(body);
    return this.profiles.update(user.id, { published: input.published });
  }

  @Get('public/profiles/:handle')
  @Public()
  public(@Param('handle') handle: string) {
    return this.profiles.public(handle.toLowerCase());
  }
}
