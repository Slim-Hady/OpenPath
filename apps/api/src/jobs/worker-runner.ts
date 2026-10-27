import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { getEnv } from '../config/env';
import { QUEUES } from '../infra/queue.service';
import { CvProcessor } from '../modules/cv/cv.processor';
import { SyncService } from './sync.service';
import { AchievementsService } from '../modules/achievements/achievements.service';
import { AdminService } from '../modules/admin/admin.service';

type JobData = Record<string, unknown>;

@Injectable()
export class WorkerRunner implements OnModuleDestroy {
  private readonly logger = new Logger(WorkerRunner.name);
  private readonly workers: Worker[] = [];
  private connection?: IORedis;

  constructor(
    private readonly cv: CvProcessor,
    private readonly sync: SyncService,
    private readonly achievements: AchievementsService,
    private readonly admin: AdminService,
  ) {
  }

  start(): void {
    this.connection = new IORedis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    this.connection.on('error', () => undefined);
    this.register(QUEUES.cv, async (data) => {
      await this.cv.handle(String(data.fileId));
    });
    this.register(QUEUES.notifications, async (data) => {
      await this.sync.deliverNotification(String(data.notificationId));
    });
    this.register(QUEUES.notificationDigest, async (data) => {
      if (data.kind === 'enqueue-digests') {
        await this.sync.enqueueDigests(data.frequency === 'WEEKLY' ? 'WEEKLY' : 'DAILY');
      }
      else if (data.userId) await this.sync.deliverDigest(String(data.userId));
    });
    this.register(QUEUES.syncProgress, async (data) => {
      await this.sync.syncProgress(typeof data.userId === 'string' ? data.userId : undefined);
    });
    this.register(QUEUES.syncSaved, async () => {
      await this.sync.syncSaved();
    });
    this.register(QUEUES.gamification, async (data) => {
      await this.achievements.evaluate(String(data.userId));
    });
    this.register(QUEUES.adminAggregate, async () => {
      await this.sync.aggregateAdmin();
      this.logger.debug(`admin snapshot captured (${(await this.admin.metrics()).capturedAt})`);
    });
    this.register(QUEUES.accountDelete, async (data) => {
      await this.sync.deleteAccount(String(data.requestId));
    });
    this.logger.log(`worker started with ${this.workers.length} queues`);
  }

  private register(name: string, handler: (data: JobData) => Promise<void>): void {
    if (!this.connection) {
      this.connection = new IORedis(getEnv().REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      this.connection.on('error', () => undefined);
    }
    const worker = new Worker(
      name,
      async (job) => {
        await handler(job.data as JobData);
      },
      { connection: this.connection, concurrency: getEnv().WORKER_CONCURRENCY },
    );
    worker.on('failed', (job, error) => {
      this.logger.warn(`job ${name}:${job?.id ?? '?'} failed: ${error.message}`);
    });
    this.workers.push(worker);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled(this.workers.map((worker) => worker.close()));
    this.connection?.disconnect();
  }
}
