import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

    async get(key: string): Promise<any> {
        return await this.cache.get(key);
    }

    async set(key: string, value: any) {
        await this.cache.set(key, value, 1000);
    }

    async del(key: string) {
        await this.cache.del(key);
    }

    async reset() {
        await this.cache.reset();
    }
}
