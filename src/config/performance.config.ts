import { registerAs } from '@nestjs/config';

export const performanceConfig = registerAs('performance', () => ({
  // Rate Limiting Configuration
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10), // Time window in seconds
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // Max requests per window
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },

  // Compression Configuration
  compression: {
    level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10),
    threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024', 10),
  },

  // Security Headers Configuration
  helmet: {
    cspEnabled: process.env.HELMET_CSP_ENABLED === 'true',
    hstsEnabled: process.env.HELMET_HSTS_ENABLED === 'true',
  },

  // Monitoring Configuration
  monitoring: {
    prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
    metricsPath: process.env.METRICS_PATH || '/metrics',
  },
}));
