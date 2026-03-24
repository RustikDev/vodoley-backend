import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

@Injectable()
export class InMemoryCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InMemoryCacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private redisClient: any = null;

  private get redisEnabled() {
    return !!process.env.REDIS_URL;
  }

  async onModuleInit() {
    if (!this.redisEnabled) return;

    try {
      const redisLib = eval('require')('redis');
      this.redisClient = redisLib.createClient({ url: process.env.REDIS_URL });
      this.redisClient.on('error', (error) =>
        this.logger.error(`Redis error: ${error.message}`),
      );
      await this.redisClient.connect();
      this.logger.log('Redis cache connected');
    } catch (error) {
      this.logger.error(
        'Failed to connect Redis cache, fallback to in-memory cache',
        error instanceof Error ? error.stack : undefined,
      );
      this.redisClient = null;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisClient?.isOpen) {
      const raw = await this.redisClient.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    }

    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.redisClient?.isOpen) {
      await this.redisClient.set(key, JSON.stringify(value), {
        PX: ttlMs,
      });
      return;
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async delete(key: string): Promise<void> {
    if (this.redisClient?.isOpen) {
      await this.redisClient.del(key);
      return;
    }
    this.store.delete(key);
  }

  async clearByPrefix(prefix: string): Promise<void> {
    if (this.redisClient?.isOpen) {
      const keys = await this.redisClient.keys(`${prefix}*`);
      if (keys.length) {
        await this.redisClient.del(keys);
      }
      return;
    }

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}
