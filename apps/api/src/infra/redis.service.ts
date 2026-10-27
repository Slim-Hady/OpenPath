import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { getEnv } from '../config/env';

type MemoryEntry = { value: string; expiresAt: number };

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: Redis;
  private available = false;
  private readonly memory = new Map<string, MemoryEntry>();

  async onModuleInit(): Promise<void> {
    const env = getEnv();
    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 2 ? null : 200),
    });
    this.client.on('error', (error) => {
      if (this.available) this.logger.warn(`redis error: ${error.message}`);
      this.available = false;
    });
    this.client.on('ready', () => {
      this.available = true;
      this.logger.log('redis connected');
    });
    try {
      await this.client.connect();
      await this.client.ping();
      this.available = true;
    } catch {
      this.logger.warn('redis unavailable; using in-process cache and disabling queue writes');
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.client?.disconnect();
  }

  isAvailable(): boolean {
    return this.available && Boolean(this.client);
  }

  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isAvailable() && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        /* fall through */
      }
    }
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.isAvailable() && this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        /* fall through */
      }
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    if (this.isAvailable() && this.client) {
      try {
        await this.client.del(key);
      } catch {
        /* ignore */
      }
    }
    this.memory.delete(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    if (this.isAvailable() && this.client) {
      try {
        const value = await this.client.incr(key);
        if (value === 1) await this.client.expire(key, ttlSeconds);
        return value;
      } catch {
        /* fall through */
      }
    }
    const current = Number((await this.get(key)) ?? '0') + 1;
    await this.set(key, String(current), ttlSeconds);
    return current;
  }
}
