import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './common/decorators';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './infra/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @Public()
  health() {
    return {
      status: 'ok',
      service: 'osh-api',
      version: process.env.npm_package_version ?? '0.1.0',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @Public()
  async ready(@Res({ passthrough: true }) response: Response) {
    const checks: Record<string, 'up' | 'down'> = { database: 'down', redis: 'down' };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch {
      checks.database = 'down';
    }
    checks.redis = (await this.redis.ping()) ? 'up' : 'down';
    const ready = checks.database === 'up';
    if (!ready) response.status(HttpStatus.SERVICE_UNAVAILABLE);
    return {
      status: ready ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
