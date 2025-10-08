import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { setupSwagger } from './performance/swagger.config';
import { LoggingService } from './performance/logging.service';
import { GracefulShutdownService } from './performance/graceful-shutdown.service';
import { LoggingInterceptor } from './performance/logging.interceptor';
import * as dotenv from 'dotenv';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import * as path from 'path';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Static file serving for uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Security Headers with Helmet
  app.use(helmet.default({
    contentSecurityPolicy: configService.get('performance.helmet.cspEnabled', true) ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    } : false,
    hsts: configService.get('performance.helmet.hstsEnabled', true) ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    } : false,
  }));

  // Response Compression
  const compressionLevel = configService.get('performance.compression.level', 6);
  const compressionThreshold = configService.get('performance.compression.threshold', 1024);
  
  app.use(compression({
    level: compressionLevel,
    threshold: compressionThreshold,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // Enable CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173', 'http://localhost:8081'];
    
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Skip-Cache'],
    credentials: true,
  });

  // Enable validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  const loggingService = app.get(LoggingService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggingService));

  // Global rate limiting guard will be applied automatically by ThrottlerModule

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
    logger.log(`📚 API Documentation available at: http://localhost:${process.env.PORT || 3000}/api/docs`);
  }

  // Setup graceful shutdown
  const gracefulShutdownService = app.get(GracefulShutdownService);
  gracefulShutdownService.registerShutdownHandler(async () => {
    logger.log('Closing application...');
    await app.close();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔐 Auth endpoints available at: http://localhost:${port}/api/auth`);
  logger.log(`📊 Health check available at: http://localhost:${port}/api/health`);
  logger.log(`📈 Metrics available at: http://localhost:${port}/api/metrics`);
  
  // Log startup completion
  loggingService.log('Application started successfully', 'Bootstrap', {
    port,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
}
bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error starting application:', error);
  process.exit(1);
});
