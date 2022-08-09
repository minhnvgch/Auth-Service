import * as redisStore from 'cache-manager-redis-store';

import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import {
  defaultConfig,
  masterConfig,
  reportConfig,
} from 'src/configs/database';

@Module({
  imports: [
    TypeOrmModule.forRoot(defaultConfig),
    TypeOrmModule.forRoot(reportConfig),
    TypeOrmModule.forRoot(masterConfig),
    AuthModule,
    CacheModule.register({store: redisStore})
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
