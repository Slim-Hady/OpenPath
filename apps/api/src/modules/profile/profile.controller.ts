import { Body, Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import {
  UpdateMeSchema,
  UpdateProfileSchema,
  type Me,
  type Profile,
  type UpdateMe,
  type UpdateProfile,
} from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser): Promise<Me> {
    return this.profile.me(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() body: unknown): Promise<Me> {
    const input: UpdateMe = UpdateMeSchema.parse(body);
    return this.profile.updateMe(user.id, input);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: RequestUser) {
    return this.profile.requestDeletion(user.id);
  }

  @Get('me/history')
  history(@CurrentUser() user: RequestUser) {
    return this.profile.history(user.id);
  }

  @Get('me/stats')
  async stats(@CurrentUser() user: RequestUser) {
    const history = await this.profile.history(user.id);
    return history.stats;
  }

  @Get('profile')
  profileForUser(@CurrentUser() user: RequestUser): Promise<Profile> {
    return this.profile.profile(user.id);
  }

  @Put('profile')
  updateProfile(@CurrentUser() user: RequestUser, @Body() body: unknown): Promise<Profile> {
    const input: UpdateProfile = UpdateProfileSchema.parse(body);
    return this.profile.updateProfile(user.id, input);
  }

  @Post('profile/complete-check')
  async completeCheck(@CurrentUser() user: RequestUser) {
    const profile = await this.profile.requireComplete(user.id);
    return { complete: true, profile };
  }
}
