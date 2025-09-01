import { ResponseDto } from '../dto/common.dto';

// User Controller
export * from './user.controller';

// Health Goal Controller
export * from './health-goal.controller';

// Dashboard Controller
export * from './dashboard.controller';

// Chat Controller
export * from './chat.controller';

// Food Log Controller
export * from './food-log.controller';

// Exercise Log Controller
export * from './exercise-log.controller';

// Sleep Log Controller
export * from './sleep-log.controller';

// Water Log Controller
export * from './water-log.controller';

// Health Metric Controller
export * from './health-metric.controller';

// Notification Controller
export * from './notification.controller';

// AI Insight Controller
export * from './ai-insight.controller';

// AI Controller
export * from './ai.controller';

// User Preference Controller
export * from './user-preference.controller';

// Common Controller Interfaces
export interface IBaseController<T, CreateDto, UpdateDto, ResponseDtoType> {
  create(createDto: CreateDto): Promise<ResponseDto<ResponseDtoType>>;
  findAll(
    searchDto?: any,
  ): Promise<ResponseDto<{ data: ResponseDtoType[]; total: number }>>;
  findById(id: number): Promise<ResponseDto<ResponseDtoType>>;
  update(
    id: number,
    updateDto: UpdateDto,
  ): Promise<ResponseDto<ResponseDtoType>>;
  delete(id: number): Promise<ResponseDto<{ message: string }>>;
}

export interface IPaginatedController<T, SearchDto, ResponseDtoType> {
  findAll(searchDto: SearchDto): Promise<
    ResponseDto<{
      data: ResponseDtoType[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    }>
  >;
}

export interface IUserSpecificController<
  T,
  CreateDto,
  UpdateDto,
  ResponseDtoType,
> {
  createForUser(
    userId: number,
    createDto: CreateDto,
  ): Promise<ResponseDto<ResponseDtoType>>;
  findAllForUser(
    userId: number,
    searchDto?: any,
  ): Promise<ResponseDto<{ data: ResponseDtoType[]; total: number }>>;
  findByIdForUser(
    id: number,
    userId: number,
  ): Promise<ResponseDto<ResponseDtoType>>;
  updateForUser(
    id: number,
    userId: number,
    updateDto: UpdateDto,
  ): Promise<ResponseDto<ResponseDtoType>>;
  deleteForUser(
    id: number,
    userId: number,
  ): Promise<ResponseDto<{ message: string }>>;
}

// Controller Decorators
export function ApiController(tag: string, path: string) {
  return function (target: any) {
    // เพิ่ม metadata สำหรับ API documentation
    Reflect.defineMetadata('api_tag', tag, target);
    Reflect.defineMetadata('api_path', path, target);
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

// Controller Response Helpers
export class ControllerResponse {
  static success<T>(data: T, message: string = 'สำเร็จ'): any {
    return {
      success: true,
      message,
      data,
      timestamp: new Date(),
    };
  }

  static error(message: string, error?: string): any {
    return {
      success: false,
      message,
      error,
      timestamp: new Date(),
    };
  }

  static withPagination<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'สำเร็จ',
  ): any {
    return {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
      timestamp: new Date(),
    };
  }
}

// Controller Error Handling
export class ControllerError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'ControllerError';
  }
}

export class ValidationControllerError extends ControllerError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class NotFoundControllerError extends ControllerError {
  constructor(message: string, details?: any) {
    super(message, 404, details);
  }
}

export class ConflictControllerError extends ControllerError {
  constructor(message: string, details?: any) {
    super(message, 409, details);
  }
}

export class UnauthorizedControllerError extends ControllerError {
  constructor(message: string, details?: any) {
    super(message, 401, details);
  }
}

// Controller Middleware Interfaces
export interface IControllerMiddleware {
  use(req: any, res: any, next: any): void;
}

export interface IControllerGuard {
  canActivate(context: any): boolean | Promise<boolean>;
}

export interface IControllerInterceptor {
  intercept(context: any, next: any): any;
}

// Controller Validation
export interface IControllerValidator {
  validate(data: any): boolean | Promise<boolean>;
  getErrors(): string[];
}

// Controller Rate Limiting
export interface IControllerRateLimiter {
  isAllowed(identifier: string): boolean;
  getRemainingAttempts(identifier: string): number;
  reset(identifier: string): void;
}

// Controller Caching
export interface IControllerCache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
}

// Controller Logging
export interface IControllerLogger {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
}

// Controller Metrics
export interface IControllerMetrics {
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

// Controller Health Check
export interface IControllerHealthCheck {
  isHealthy(): boolean | Promise<boolean>;
  getHealthStatus(): any;
}

// Controller Versioning
export interface IControllerVersioning {
  getVersion(): string;
  isVersionSupported(version: string): boolean;
  getSupportedVersions(): string[];
}

// Controller Documentation
export interface IControllerDocumentation {
  getApiDocs(): any;
  getEndpointDocs(): any;
  getSchemaDocs(): any;
}
