import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Clear any existing metrics
    const { register } = require('prom-client');
    register.clear();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when metrics are enabled', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue(true);
    });

    it('should record HTTP request duration', () => {
      expect(() => {
        service.recordHttpRequestDuration('GET', '/api/test', 200, 0.5);
      }).not.toThrow();
    });

    it('should record HTTP request total', () => {
      expect(() => {
        service.recordHttpRequestTotal('GET', '/api/test', 200);
      }).not.toThrow();
    });

    it('should record HTTP request error', () => {
      expect(() => {
        service.recordHttpRequestError('GET', '/api/test', 'ValidationError');
      }).not.toThrow();
    });

    it('should record cache hit', () => {
      expect(() => {
        service.recordCacheHit('api', 'user.*');
      }).not.toThrow();
    });

    it('should record cache miss', () => {
      expect(() => {
        service.recordCacheMiss('api', 'user.*');
      }).not.toThrow();
    });

    it('should record cache operation', () => {
      expect(() => {
        service.recordCacheOperation('set', 'api');
      }).not.toThrow();
    });

    it('should set active users', () => {
      expect(() => {
        service.setActiveUsers(150);
      }).not.toThrow();
    });

    it('should record API response time', () => {
      expect(() => {
        service.recordApiResponseTime('/api/users', 'GET', 0.3);
      }).not.toThrow();
    });

    it('should get metrics as string', async () => {
      const metrics = await service.getMetrics();
      expect(typeof metrics).toBe('string');
      expect(metrics).toContain('# HELP');
    });
  });

  describe('when metrics are disabled', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue(false);
    });

    it('should not record metrics when disabled', () => {
      expect(() => {
        service.recordHttpRequestDuration('GET', '/api/test', 200, 0.5);
        service.recordHttpRequestTotal('GET', '/api/test', 200);
        service.recordHttpRequestError('GET', '/api/test', 'ValidationError');
        service.recordCacheHit('api', 'user.*');
        service.recordCacheMiss('api', 'user.*');
        service.recordCacheOperation('set', 'api');
        service.setActiveUsers(150);
        service.recordApiResponseTime('/api/users', 'GET', 0.3);
      }).not.toThrow();
    });

    it('should return disabled message for metrics', async () => {
      const metrics = await service.getMetrics();
      expect(metrics).toBe('# Prometheus metrics disabled\n');
    });
  });

  describe('clearMetrics', () => {
    it('should clear metrics when enabled', () => {
      mockConfigService.get.mockReturnValue(true);
      
      expect(() => {
        service.clearMetrics();
      }).not.toThrow();
    });

    it('should not throw when clearing metrics when disabled', () => {
      mockConfigService.get.mockReturnValue(false);
      
      expect(() => {
        service.clearMetrics();
      }).not.toThrow();
    });
  });
});
