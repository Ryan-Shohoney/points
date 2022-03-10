import { Module } from '@nestjs/common';
import {LedgerRepositoryModule} from '../common/repository/ledger/ledger-repository.module';
import { PaymentRepositoryModule } from '../common/repository/payment/payment-repository.module';
import { UserRepositoryModule } from '../common/repository/user/user-repository.module';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';

@Module({
  imports: [UserRepositoryModule, PaymentRepositoryModule, LedgerRepositoryModule],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
