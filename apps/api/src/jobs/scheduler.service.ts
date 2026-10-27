import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueueService, QUEUES } from '../infra/queue.service';
import { getEnv } from '../config/env';

/**
 * Cron only enqueues. The worker does the work.
 * Set ENABLE_SCHEDULER=false on the worker container (and in tests).
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly queue: QueueService) {}

  @Cron('*/5 * * * *')
  async everyFiveMinutes(): Promise<void> {
    if (!getEnv().ENABLE_SCHEDULER) return;
    const stamp = new Date().toISOString().slice(0, 16);
    await this.queue.add(QUEUES.syncProgress, { window: stamp }, `sync-progress:${stamp}`);
    await this.queue.add(QUEUES.adminAggregate, { window: stamp }, `admin-aggregate:${stamp}`);
  }

  @Cron('*/15 * * * *')
  async everyFifteenMinutes(): Promise<void> {
    if (!getEnv().ENABLE_SCHEDULER) return;
    const stamp = new Date().toISOString().slice(0, 16);
    await this.queue.add(QUEUES.syncSaved, { window: stamp }, `sync-saved:${stamp}`);
  }

  @Cron('0 8 * * *')
  async dailyDigest(): Promise<void> {
    if (!getEnv().ENABLE_SCHEDULER) return;
    await this.queue.add(
      QUEUES.notificationDigest,
      { kind: 'enqueue-digests' },
      `digest-enqueue:${new Date().toISOString().slice(0, 10)}`,
    );
  }

  async enqueueDeletion(requestId: string): Promise<void> {
    const queued = await this.queue.add(QUEUES.accountDelete, { requestId }, `delete:${requestId}`);
    if (!queued) this.logger.warn(`deletion ${requestId} could not be queued`);
  }
}
