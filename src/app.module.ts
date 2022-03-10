import { Module } from '@nestjs/common';
import { BalanceModule } from './balance/balance.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [BalanceModule, UserModule],
})
export class AppModule {}
