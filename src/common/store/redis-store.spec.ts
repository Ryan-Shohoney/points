import { Test, TestingModule } from '@nestjs/testing';
import { RedisStore } from './redis-store';
jest.mock('ioredis');
import * as redis from 'ioredis';

describe('RedisClient', () => {
  let provider: RedisStore;

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisStore],
    }).compile();

    provider = module.get<RedisStore>(RedisStore);
    expect(provider).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should call connect()', async () => {
      const connectSpy = jest.spyOn(redis.prototype, 'connect');
      const module: TestingModule = await Test.createTestingModule({
        providers: [RedisStore],
      }).compile();
      await module.init();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('get client()', () => {
    it('returns the internal redis client', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RedisStore],
      }).compile();
      await module.init();
      provider = module.get<RedisStore>(RedisStore);
      expect(provider.client).toBeDefined();
      expect(provider.client).toBeInstanceOf(redis);
    });
  });
});
