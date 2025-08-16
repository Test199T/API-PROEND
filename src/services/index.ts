// Export all Services
export * from './user.service';
export * from './health-goal.service';
export * from './health-metric.service';
export * from './food-log.service';
export * from './exercise-log.service';
export * from './sleep-log.service';
export * from './water-log.service';
export * from './notification.service';
export * from './dashboard.service';
export * from './ai.service';
export * from './chat.service';
export * from './supabase.service';

// Common Service Interfaces
export interface IBaseService<T, CreateDto, UpdateDto, ResponseDto> {
  create(createDto: CreateDto): Promise<ResponseDto>;
  findAll(searchDto?: any): Promise<{ data: ResponseDto[]; total: number }>;
  findById(id: number): Promise<ResponseDto>;
  update(id: number, updateDto: UpdateDto): Promise<ResponseDto>;
  delete(id: number): Promise<{ message: string }>;
}

export interface IPaginatedService<T, SearchDto, ResponseDto> {
  findAll(searchDto: SearchDto): Promise<{
    data: ResponseDto[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }>;
}

export interface IUserSpecificService<T, CreateDto, UpdateDto, ResponseDto> {
  createForUser(userId: number, createDto: CreateDto): Promise<ResponseDto>;
  findAllForUser(
    userId: number,
    searchDto?: any,
  ): Promise<{ data: ResponseDto[]; total: number }>;
  findByIdForUser(id: number, userId: number): Promise<ResponseDto>;
  updateForUser(
    id: number,
    userId: number,
    updateDto: UpdateDto,
  ): Promise<ResponseDto>;
  deleteForUser(id: number, userId: number): Promise<{ message: string }>;
}

// Service Factory
export class ServiceFactory {
  static createService<T>(
    serviceClass: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    return new serviceClass(...args);
  }
}

// Service Decorators
export function InjectableService() {
  return function (target: any) {
    // เพิ่ม metadata สำหรับ dependency injection
    Reflect.defineMetadata('injectable', true, target);
  };
}

export function ValidateUserAccess() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // ตรวจสอบการเข้าถึงของผู้ใช้
      const userId = args[0];
      const resourceId = args[1];

      if (userId && resourceId) {
        // TODO: เพิ่มการตรวจสอบสิทธิ์
        // const hasAccess = await this.checkUserAccess(userId, resourceId);
        // if (!hasAccess) {
        //   throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
        // }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Service Error Handling
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

// Service Response Wrapper
export class ServiceResponse<T> {
  constructor(
    public readonly success: boolean,
    public readonly data?: T,
    public readonly message?: string,
    public readonly error?: ServiceError,
  ) {}

  static success<T>(data: T, message?: string): ServiceResponse<T> {
    return new ServiceResponse<T>(true, data, message);
  }

  static error<T>(error: ServiceError): ServiceResponse<T> {
    return new ServiceResponse<T>(false, undefined, error.message, error);
  }

  static notFound<T>(message: string): ServiceResponse<T> {
    return ServiceResponse.error<T>(new NotFoundError(message));
  }

  static conflict<T>(message: string): ServiceResponse<T> {
    return ServiceResponse.error<T>(new ConflictError(message));
  }

  static unauthorized<T>(message: string): ServiceResponse<T> {
    return ServiceResponse.error<T>(new UnauthorizedError(message));
  }

  static validationError<T>(
    message: string,
    details?: any,
  ): ServiceResponse<T> {
    return ServiceResponse.error<T>(new ValidationError(message, details));
  }
}

// Service Cache Interface
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Service Logger Interface
export interface ILoggerService {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}

// Service Metrics Interface
export interface IMetricsService {
  incrementCounter(name: string, labels?: Record<string, string>): void;
  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void;
  recordGauge(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void;
  startTimer(name: string): () => void;
}
