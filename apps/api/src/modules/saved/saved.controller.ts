import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateSavedListSchema,
  MoveItemSchema,
  SaveItemSchema,
  UpdateSavedListSchema,
  type CreateSavedList,
  type MoveItem,
  type SaveItem,
  type UpdateSavedList,
} from '@osh/contracts';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/decorators';
import { SavedService } from './saved.service';

@Controller('saved')
@Roles('DEVELOPER')
export class SavedController {
  constructor(private readonly saved: SavedService) {}

  @Get('lists')
  lists(@CurrentUser() user: RequestUser) {
    return this.saved.lists(user.id);
  }

  @Post('lists')
  create(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: CreateSavedList = CreateSavedListSchema.parse(body);
    return this.saved.createList(user.id, input);
  }

  @Patch('lists/:id')
  rename(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: unknown) {
    const input: UpdateSavedList = UpdateSavedListSchema.parse(body);
    return this.saved.renameList(user.id, id, input.name);
  }

  @Delete('lists/:id')
  removeList(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.saved.deleteList(user.id, id);
  }

  @Get('lists/:id')
  detail(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.saved.detail(user.id, id);
  }

  @Post('items')
  add(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    const input: SaveItem = SaveItemSchema.parse(body);
    return this.saved.add(user.id, input);
  }

  @Patch('items/:id')
  move(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: unknown) {
    const input: MoveItem = MoveItemSchema.parse(body);
    return this.saved.move(user.id, id, input.listId);
  }

  @Delete('items/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.saved.remove(user.id, id);
  }

  @Post('items/:id/select')
  select(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.saved.select(user.id, id);
  }
}
