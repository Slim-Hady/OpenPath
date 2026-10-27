import 'reflect-metadata';
process.env.ENABLE_SCHEDULER = 'false';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WorkerRunner } from './jobs/worker-runner';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();
  app.get(WorkerRunner).start();
  new Logger('Worker').log('worker context ready');
}

void bootstrap();
