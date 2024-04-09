import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  public client;
  private logger: Logger = new Logger('CacheService');
  constructor(private redisService: RedisService) { }

  async onModuleInit() {
    try {
      this.getClient();
      this.logger.log('redis init');
    } catch (error) {
      console.error('error', error);
    }
  }

  async onModuleDestroy() {
    this.client = null;
  }

  public async getClient() {
    this.client = await this.redisService.getClient();
  }

  public async set(key: string, value: any, seconds?: number) {
    value = JSON.stringify(value);
    if (!this.client) {
      await this.getClient();
    }
    if (!seconds) {
      await this.client.set(key, value);
    } else {
      await this.client.set(key, value, 'EX', seconds);
    }
  }
  // rpop
  public async rpop(key: string) {
    if (!this.client) {
      await this.getClient();
    }
    const data = await this.client.rpop(key);
    if (!data) return;
    return JSON.parse(data);
  }
  //获取Range值的方法
  public async lpop(key: string) {
    if (!this.client) {
      await this.getClient();
    }
    const data = await this.client.lpop(key);
    if (!data) return;
    return JSON.parse(data);
  }

  //获取值的方法
  public async get(key: string) {
    if (!this.client) {
      await this.getClient();
    }
    const data = await this.client.get(key);
    if (!data) return;
    return JSON.parse(data);
  }

  public async keys(key: string) {
    if (!this.client) {
      await this.getClient();
    }
    const data = await this.client.keys(key);
    if (!data) return;
    return data;
  }
  //获取值的方法
  public async del(key: string) {
    if (!this.client) {
      await this.getClient();
    }
    await this.client.del(key);
  }
  public async hDel(key: string, data: any) {
    if (!this.client) {
      await this.getClient();
    }
    return this.client.hdel(key, data);
  }
  public async hSet(key: string, data: any, value: any) {
    if (!this.client) {
      await this.getClient();
    }
    return this.client.hset(key, data, value);
  }
  // 清理缓存
  public async flushall(): Promise<any> {
    if (!this.client) {
      await this.getClient();
    }

    await this.client.flushall();
  }

  // publish(channel: string, message: string, callback?: Callback<number>): Pipeline;
  public async publish(channel: string, message: string): Promise<any> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.publish(channel, message);
  }
}
