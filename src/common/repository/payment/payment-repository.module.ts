import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { PaymentRepository } from './payment-repository.provider';

@Module({
  imports: [StoreModule],
  providers: [PaymentRepository],
  exports: [PaymentRepository],
})
export class PaymentRepositoryModule {}
