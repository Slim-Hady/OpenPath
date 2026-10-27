import { Module } from '@nestjs/common';
import { SavedController } from './saved.controller';
import { SavedService } from './saved.service';
import { SelectionModule } from '../selection/selection.module';

@Module({
  imports: [SelectionModule],
  controllers: [SavedController],
  providers: [SavedService],
  exports: [SavedService],
})
export class SavedModule {}
