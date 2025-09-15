import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Log request start
    this.loggingService.log(
      `Incoming Request: ${method} ${url}`,
      LoggingInterceptor.name,
      {
        ip,
        userAgent,
        headers: this.sanitizeHeaders(headers),
      },
    );

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        // Log successful request
        this.loggingService.logRequest(method, url, statusCode, duration, userAgent);

        // Log performance if request took too long
        if (duration > 1000) {
          this.loggingService.logPerformance(
            `${method} ${url}`,
            duration,
            { statusCode, ip, userAgent },
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log error
        this.loggingService.logError(error, LoggingInterceptor.name, {
          method,
          url,
          statusCode,
          duration,
          ip,
          userAgent,
        });

        throw error;
      }),
    );
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    
    return sanitized;
  }
}
