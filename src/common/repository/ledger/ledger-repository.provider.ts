import { Injectable } from '@nestjs/common';
import { RedisStore } from '../../store/redis-store';
import { IRepository } from '../../store/store.types';
import { LedgerDto } from './ledger.dto';

@Injectable()
export class LedgerRepository implements IRepository<LedgerDto> {
  public readonly keyPrefix = 'ledger';
  constructor(private readonly dataStore: RedisStore) {}

  async delete(id: string): Promise<boolean> {
    const { userId } = await this.findById(id);
    if (!userId) {
      return false;
    }
    await this.dataStore.client.del(this.generateKey(id));

    return true;
  }

  async findById(id: string): Promise<LedgerDto> {
    const { paymentId, userId } = await this.dataStore.client.hgetall(
      this.generateKey(id),
    );
    return {
      paymentId,
      userId,
    };
  }

  async insert(entity: LedgerDto): Promise<boolean> {
    const { userId } = entity;

    await this.dataStore.client.hset(this.generateKey(userId), { ...entity });

    return true;
  }

  private generateKey(k: string): string {
    return `${this.keyPrefix}:${k}`;
  }
}
