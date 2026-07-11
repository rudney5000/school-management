import Redis from 'ioredis'
import { env } from '@/config/env'

export const redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    tls: env.REDIS_TLS ? {} : undefined,
})

redisClient.on('connect', () => console.log('✓ Redis connected'))
redisClient.on('error', (err) => console.error('✗ Redis error:', err))