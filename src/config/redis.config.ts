import { registerAs } from '@nestjs/config';
import { performanceConfig } from './performance.config';

export const redisConfig = registerAs('redis', () => {
  const config = performanceConfig();
  
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryDelayOnFailover: config.redis.retryDelayOnFailover,
    enableReadyCheck: config.redis.enableReadyCheck,
    maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
    // Connection pool settings
    family: 4, // IPv4
    keepAlive: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
    // Retry settings
    retryDelayOnClusterDown: 300,
    // Health check
    lazyConnect: true,
  };
});
