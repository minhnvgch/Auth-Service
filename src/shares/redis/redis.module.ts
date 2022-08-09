import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from "@nestjs/common";

import { RedisService } from "src/shares/redis/redis.service";

@Module({
    imports: [
        CacheModule.register({
            store: redisStore,
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            ttl: 60*60*24*365,
        }),
    ],
    providers: [RedisService],
    exports: [RedisService, CacheModule]
})

export class RedisModule {}