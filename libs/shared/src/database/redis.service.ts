import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host');
    const port = this.configService.get<number>('redis.port');
    const password = this.configService.get<string>('redis.password');

    const url = `redis://${password ? `:${password}@` : ''}${host}:${port}`;

    this.client = createClient({ url });
    await this.client.connect();

    this.publisher = createClient({ url });
    await this.publisher.connect();

    this.subscriber = createClient({ url });
    await this.subscriber.connect();

    console.log(`Connected to Redis: ${host}:${port}`);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }

    if (this.publisher) {
      await this.publisher.quit();
    }

    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  getPublisher(): RedisClientType {
    return this.publisher;
  }

  getSubscriber(): RedisClientType {
    return this.subscriber;
  }

  async publish(channel: string, message: string | object): Promise<number> {
    const messageStr =
      typeof message === 'string' ? message : JSON.stringify(message);
    return this.publisher.publish(channel, messageStr);
  }

  async subscribe(
    channel: string,
    callback: (message: string, channel: string) => void,
  ) {
    await this.subscriber.subscribe(channel, callback);
  }

  async set(
    key: string,
    value: string | object,
    ttl?: number,
  ): Promise<string> {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl) {
      return this.client.set(key, valueStr, { EX: ttl });
    }

    return this.client.set(key, valueStr);
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
