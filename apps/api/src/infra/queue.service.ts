import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { getEnv } from '../config/env';
import { AppError } from '../common/errors';

export const QUEUES = {
  cv: 'cv.extract',
  notifications: 'notifications.deliver',
  notificationDigest: 'notifications.digest',
  syncProgress: 'github.sync.progress',
  syncSaved: 'github.sync.saved',
  gamification: 'gamification.evaluate',
  adminAggregate: 'admin.aggregate',
  accountDelete: 'account.delete',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connections: IORedis[] = [];
  private readonly queues = new Map<string, Queue>();

  private connection(): IORedis {
    const conn = new IORedis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => (times > 2 ? null : 200),
    });
    conn.on('error', () => undefined);
    this.connections.push(conn);
    return conn;
  }

  queue(name: QueueName): Queue {
    const existing = this.queues.get(name);
    if (existing) return existing;
    const queue = new Queue(name, { connection: this.connection() });
    this.queues.set(name, queue);
    return queue;
  }

  async add<T extends Record<string, unknown>>(
    name: QueueName,
    data: T,
    idempotencyKey: string,
    options: { delayMs?: number } = {},
  ): Promise<boolean> {
    try {
      await this.queue(name).add(name, data, {
        jobId: idempotencyKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120),
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
        delay: options.delayMs,
      });
      return true;
    } catch (error) {
      this.logger.warn(
        `could not enqueue ${name}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return false;
    }
  }

  async addOrFail<T extends Record<string, unknown>>(
    name: QueueName,
    data: T,
    idempotencyKey: string,
    options: { delayMs?: number } = {},
  ): Promise<void> {
    const queued = await this.add(name, data, idempotencyKey, options);
    if (!queued) {
      throw new AppError('QUEUE_UNAVAILABLE', 'Background work is unavailable. Try again shortly.', 503);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([...this.queues.values()].map((queue) => queue.close()));
    for (const connection of this.connections) connection.disconnect();
  }
}
