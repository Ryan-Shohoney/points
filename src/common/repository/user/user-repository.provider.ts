import { Injectable } from '@nestjs/common';
import { RedisStore } from '../../store/redis-store';
import { IRepository } from '../../store/store.types';
import { UpdateUserDto, UserDto } from './user.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserRepository implements IRepository<UserDto> {
  private readonly keyPrefix = 'user';
  constructor(private readonly dataStore: RedisStore) {}

  async delete(id: string): Promise<boolean> {
    const presentKey = await this.dataStore.client.sismember(
      this.keyPrefix,
      id,
    );
    if (!presentKey) {
      return false;
    }
    const [result] = await Promise.all([
      this.dataStore.client.del(id),
      this.dataStore.client.srem(this.keyPrefix, id),
    ]);

    return result > 0;
  }

  async findById(id: string): Promise<UserDto> {
    const user = await this.dataStore.client.hgetall(id);
    return user.id ? this.coerce(user) : null;
  }

  async insert({
    firstName,
    lastName,
    points = 0,
  }: UpdateUserDto): Promise<string> {
    const id = uuid();
    await Promise.all([
      this.dataStore.client.sadd(this.keyPrefix, id),
      this.dataStore.client.hset(id, { firstName, lastName, points, id }),
    ]);

    return id;
  }

  async list(): Promise<Array<UserDto>> {
    const keys = await this.dataStore.client.smembers(this.keyPrefix);
    const pipe = this.dataStore.client.pipeline();
    keys.forEach((k) => pipe.hgetall(k));
    return (await pipe.exec()).map((v) => this.coerce(v[1]));
  }

  async update(id: string, entity: UpdateUserDto): Promise<boolean> {
    const current = await this.dataStore.client.hgetall(id);
    const merged = { ...current, ...entity };
    const numUpdated = await this.dataStore.client.hset(id, merged);
    return numUpdated > 0;
  }

  private coerce(entity: Record<string, string>): UserDto {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      id: entity.id,
      points: parseInt(entity.points.toString(), 10),
    };
  }
}
