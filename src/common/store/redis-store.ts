import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import * as IORedis from 'ioredis';

@Injectable()
export class RedisStore implements OnModuleInit, OnApplicationShutdown {
  private readonly _client: IORedis.Redis;
  constructor() {
    this._client = new IORedis({ lazyConnect: true });
  }
  public async onModuleInit(): Promise<void> {
    await this._client.connect();
  }
  public async onApplicationShutdown() {
    await this._client.disconnect();
  }

  get client() {
    return this._client;
  }
}
