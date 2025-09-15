import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    // Create winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      defaultMeta: {
        service: 'health-api',
        environment: nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
      },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const contextStr = context ? `[${context}]` : '';
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
            }),
          ),
        }),
      ],
    });

    // Add file transport in production
    if (nodeEnv === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );

      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }
  }

  log(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any): void {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any): void {
    this.logger.verbose(message, { context, ...meta });
  }

  // Custom logging methods for performance monitoring
  logRequest(method: string, url: string, statusCode: number, duration: number, userAgent?: string): void {
    this.logger.info('HTTP Request', {
      type: 'http_request',
      method,
      url,
      statusCode,
      duration,
      userAgent,
    });
  }

  logError(error: Error, context?: string, meta?: any): void {
    this.logger.error('Application Error', {
      type: 'application_error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      ...meta,
    });
  }

  logPerformance(operation: string, duration: number, meta?: any): void {
    this.logger.info('Performance Metric', {
      type: 'performance',
      operation,
      duration,
      ...meta,
    });
  }

  logCache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, duration?: number): void {
    this.logger.debug('Cache Operation', {
      type: 'cache',
      operation,
      key,
      duration,
    });
  }

  logSecurity(event: string, ip?: string, userAgent?: string, meta?: any): void {
    this.logger.warn('Security Event', {
      type: 'security',
      event,
      ip,
      userAgent,
      ...meta,
    });
  }

  logBusiness(event: string, userId?: string, meta?: any): void {
    this.logger.info('Business Event', {
      type: 'business',
      event,
      userId,
      ...meta,
    });
  }
}
