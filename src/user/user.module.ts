import { Module } from '@nestjs/common';
import { LedgerRepositoryModule } from '../common/repository/ledger/ledger-repository.module';
import { PaymentRepositoryModule } from '../common/repository/payment/payment-repository.module';
import { UserRepositoryModule } from '../common/repository/user/user-repository.module';
import { StoreModule } from '../common/store/store.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    StoreModule,
    UserRepositoryModule,
    PaymentRepositoryModule,
    LedgerRepositoryModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
