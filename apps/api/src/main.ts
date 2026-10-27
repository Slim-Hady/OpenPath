import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getEnv } from './config/env';

async function bootstrap(): Promise<void> {
  const env = getEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false });
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.set('trust proxy', 1);
  app.enableShutdownHooks();
  await app.listen(env.PORT, '0.0.0.0');
  new Logger('Bootstrap').log(`api listening on :${env.PORT}`);
}

void bootstrap();
