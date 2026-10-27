import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EncryptionService } from './encryption.service';
import { QueueService } from './queue.service';
import { EmailService } from './email.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [RedisService, EncryptionService, QueueService, EmailService, StorageService],
  exports: [RedisService, EncryptionService, QueueService, EmailService, StorageService],
})
export class InfraModule {}
