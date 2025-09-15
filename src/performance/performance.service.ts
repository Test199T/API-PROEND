import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}:`, error);
    }
  }

  /**
   * Delete cached data
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // Note: cache-manager doesn't have a reset method, 
      // this would need to be implemented based on the specific cache store
      this.logger.warn('Cache reset not implemented for current cache store');
    } catch (error) {
      this.logger.error('Failed to reset cache:', error);
    }
  }

  /**
   * Generate cache key for user-specific data
   */
  generateUserCacheKey(userId: string, resource: string): string {
    return `user:${userId}:${resource}`;
  }

  /**
   * Generate cache key for API responses
   */
  generateApiCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `api:${endpoint}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Cache user data with automatic expiration
   */
  async cacheUserData<T>(
    userId: string,
    resource: string,
    data: T,
    ttl: number = 300,
  ): Promise<void> {
    const key = this.generateUserCacheKey(userId, resource);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached user data
   */
  async getCachedUserData<T>(
    userId: string,
    resource: string,
  ): Promise<T | undefined> {
    const key = this.generateUserCacheKey(userId, resource);
    return await this.get<T>(key);
  }

  /**
   * Invalidate user cache
   */
  async invalidateUserCache(userId: string, resource?: string): Promise<void> {
    if (resource) {
      const key = this.generateUserCacheKey(userId, resource);
      await this.del(key);
    } else {
      // Invalidate all user cache (this would need to be implemented based on your cache store)
      this.logger.warn('Bulk user cache invalidation not implemented');
    }
  }
}
