import { Injectable } from '@nestjs/common';
import { RedisStore } from '../../store/redis-store';
import { IRepository } from '../../store/store.types';
import { Ledger, RewardDto, PaymentDto } from './payment.dto';

@Injectable()
export class PaymentRepository implements IRepository<Ledger> {
  private readonly keyPrefix = 'ledger:';
  constructor(private readonly dataStore: RedisStore) {}

  async getCurrentPayer(id: string): Promise<RewardDto> {
    const payer = await this.dataStore.client.lrange(
      this.generateKey(id),
      -1,
      -1,
    );
    return JSON.parse(payer[0]);
  }

  async updateCurrentPayer(id: string, payment: PaymentDto): Promise<boolean> {
    if (payment.amount === 0) {
      await this.dataStore.client.rpop(this.generateKey(id));
    } else {
      await this.dataStore.client.lset(
        this.generateKey(id),
        -1,
        JSON.stringify(payment),
      );
    }

    return true;
  }

  async delete(id: string): Promise<boolean> {
    const numDeleted = await this.dataStore.client.del(this.generateKey(id));
    return numDeleted === 1;
  }

  async findById(id: string): Promise<Ledger> {
    const ledger = await this.dataStore.client.lrange(
      this.generateKey(id),
      0,
      -1,
    );
    return ledger.map((payment) => JSON.parse(payment));
  }

  async insert(entity: Ledger): Promise<boolean> {
    const { userId, ...rest } = entity[0];
    const numInserted = await this.dataStore.client.lpush(
      this.generateKey(userId),
      JSON.stringify(rest),
    );
    return numInserted > 0;
  }

  private generateKey(slug: string) {
    return `${this.keyPrefix}${slug}`;
  }
}
