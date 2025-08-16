import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.message;
      } else {
        message = exception.message;
        error = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Handle specific error types
      if (exception.message.includes('fetch failed')) {
        status = HttpStatus.BAD_GATEWAY;
        message = 'External service temporarily unavailable';
        error = 'Service Unavailable';
      } else if (exception.message.includes('timeout')) {
        status = HttpStatus.REQUEST_TIMEOUT;
        message = 'Request timeout';
        error = 'Request Timeout';
      } else if (exception.message.includes('network')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Network error';
        error = 'Network Error';
      }
    }

    // Log the error
    this.logger.error(
      `Exception occurred: ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Send error response
    const errorResponse = {
      success: false,
      message,
      error,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
