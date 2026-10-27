import { Global, Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

@Global()
@Module({
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
