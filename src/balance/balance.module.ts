import { Module } from '@nestjs/common';
import { PaymentRepositoryModule } from '../common/repository/payment/payment-repository.module';
import { UserRepositoryModule } from '../common/repository/user/user-repository.module';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';

@Module({
  imports: [UserRepositoryModule, PaymentRepositoryModule],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
