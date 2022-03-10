import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { UserRepository } from './user-repository.provider';

@Module({
  imports: [StoreModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserRepositoryModule {}
