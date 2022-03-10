import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { LedgerRepository } from './ledger-repository.provider';

@Module({
  imports: [StoreModule],
  providers: [LedgerRepository],
  exports: [LedgerRepository],
})
export class LedgerRepositoryModule {}
