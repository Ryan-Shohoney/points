import { Module } from '@nestjs/common';
import { RedisStore } from './redis-store';

/**
 *  Ideally I'd provide a token for the store and assign a class to that token.  This would allow for dropping in
 *  different databases.  The problem is that this would require implementing a really robust interface, which would
 *  take a lot of time to nail down the specifics. So, for now we'll just rely on a concretion at this level.
 */
@Module({
  providers: [RedisStore],
  exports: [RedisStore],
})
export class StoreModule {}
