import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { PerformanceService } from './performance.service';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let cacheManager: any;
  let configService: ConfigService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PerformanceService>(PerformanceService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached data when key exists', async () => {
      const testData = { id: 1, name: 'test' };
      mockCacheManager.get.mockResolvedValue(testData);

      const result = await service.get('test-key');

      expect(mockCacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return undefined when key does not exist', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('non-existent-key');

      expect(result).toBeUndefined();
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.get('error-key');

      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set data in cache', async () => {
      const testData = { id: 1, name: 'test' };
      mockCacheManager.set.mockResolvedValue(undefined);

      await service.set('test-key', testData, 300);

      expect(mockCacheManager.set).toHaveBeenCalledWith('test-key', testData, 300);
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

      await expect(service.set('error-key', 'data')).resolves.not.toThrow();
    });
  });

  describe('del', () => {
    it('should delete data from cache', async () => {
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.del('test-key');

      expect(mockCacheManager.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.del.mockRejectedValue(new Error('Cache error'));

      await expect(service.del('error-key')).resolves.not.toThrow();
    });
  });

  describe('generateUserCacheKey', () => {
    it('should generate correct user cache key', () => {
      const result = service.generateUserCacheKey('user123', 'profile');

      expect(result).toBe('user:user123:profile');
    });
  });

  describe('generateApiCacheKey', () => {
    it('should generate correct API cache key without params', () => {
      const result = service.generateApiCacheKey('users.list');

      expect(result).toMatch(/^api:users\.list:/);
    });

    it('should generate correct API cache key with params', () => {
      const params = { page: 1, limit: 10 };
      const result = service.generateApiCacheKey('users.list', params);

      expect(result).toMatch(/^api:users\.list:/);
    });
  });

  describe('cacheUserData', () => {
    it('should cache user data with default TTL', async () => {
      const userData = { id: 1, name: 'John' };
      mockCacheManager.set.mockResolvedValue(undefined);

      await service.cacheUserData('user123', 'profile', userData);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user:user123:profile',
        userData,
        300
      );
    });

    it('should cache user data with custom TTL', async () => {
      const userData = { id: 1, name: 'John' };
      mockCacheManager.set.mockResolvedValue(undefined);

      await service.cacheUserData('user123', 'profile', userData, 600);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user:user123:profile',
        userData,
        600
      );
    });
  });

  describe('getCachedUserData', () => {
    it('should get cached user data', async () => {
      const userData = { id: 1, name: 'John' };
      mockCacheManager.get.mockResolvedValue(userData);

      const result = await service.getCachedUserData('user123', 'profile');

      expect(mockCacheManager.get).toHaveBeenCalledWith('user:user123:profile');
      expect(result).toEqual(userData);
    });
  });

  describe('invalidateUserCache', () => {
    it('should invalidate specific user cache', async () => {
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.invalidateUserCache('user123', 'profile');

      expect(mockCacheManager.del).toHaveBeenCalledWith('user:user123:profile');
    });

    it('should warn when invalidating all user cache', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'warn').mockImplementation();

      await service.invalidateUserCache('user123');

      expect(loggerSpy).toHaveBeenCalledWith('Bulk user cache invalidation not implemented');

      loggerSpy.mockRestore();
    });
  });
});
