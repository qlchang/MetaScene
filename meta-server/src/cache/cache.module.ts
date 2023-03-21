import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule } from 'nestjs-redis';
import configuration from 'src/config/configuration';

console.log('redis配置1', configuration().redis);
@Module({
  imports: [RedisModule.register(configuration().redis)],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
