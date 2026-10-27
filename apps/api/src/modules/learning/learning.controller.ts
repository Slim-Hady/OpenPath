import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '../../common/decorators';
import { LearningService } from './learning.service';

const SearchSchema = z.object({
  q: z.string().max(120).optional(),
  topic: z.string().max(60).optional(),
});

@Controller('learning')
@Public()
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get()
  search(@Query() query: unknown) {
    const input = SearchSchema.parse(query ?? {});
    return this.learning.search(input.q, input.topic);
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.learning.bySlug(slug);
  }
}
