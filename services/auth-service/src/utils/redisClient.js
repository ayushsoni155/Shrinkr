'use strict';

const Redis = require('ioredis');

let redisClient;

function getRedisClient() {
    if (!redisClient) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            password: process.env.REDIS_PASSWORD || 'redispassword',
            retryStrategy: (times) => Math.min(times * 50, 2000),
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });

        redisClient.on('connect', () => console.log('[Redis] Connected'));
        redisClient.on('error', (err) => console.error('[Redis] Error:', err.message));
    }

    return redisClient;
}

module.exports = { getRedisClient };
