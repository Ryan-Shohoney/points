import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { RedisStore } from '../../store/redis-store';
import { IRepository } from '../../store/store.types';
import { RewardDto, PaymentDto } from './payment.dto';

@Injectable()
export class PaymentRepository
  implements IRepository<RewardDto | Array<RewardDto>>
{
  public readonly keyPrefix = 'payment';
  constructor(private readonly dataStore: RedisStore) {}

  async getCurrentPayer(id: string): Promise<RewardDto> {
    const payer = await this.dataStore.client.zrange(
      this.generateKey(id),
      0,
      0,
    );
    return JSON.parse(payer[0]);
  }

  async updateCurrentPayer(id: string, payment: PaymentDto): Promise<boolean> {
    const entry = await this.dataStore.client.zpopmin(this.generateKey(id), 1);
    if (payment.amount > 0) {
      const newEntry = JSON.parse(entry[0]) as RewardDto;
      await this.dataStore.client.zadd(
        this.generateKey(id),
        newEntry.timestampMS,
        JSON.stringify(payment),
      );
    }

    return true;
  }

  async delete(id: string): Promise<boolean> {
    const numDeleted = await this.dataStore.client.del(this.generateKey(id));
    return numDeleted === 1;
  }

  async findById(id: string): Promise<Array<RewardDto>> {
    const ledger = await this.dataStore.client.zrange(
      this.generateKey(id),
      0,
      -1,
    );
    return ledger.map((x) => JSON.parse(x) as RewardDto);
  }

  async insert(entity: RewardDto): Promise<string> {
    const ledgerId = uuid();
    return this.update(ledgerId, entity);
  }

  async update(id: string, entity: RewardDto): Promise<any> {
    await this.dataStore.client.zadd(
      this.generateKey(id),
      entity.timestampMS,
      JSON.stringify({ ...entity, receivedTs: Date.now() }),
    );
    return id;
  }

  private generateKey(slug: string) {
    return `${this.keyPrefix}:${slug}`;
  }
}
