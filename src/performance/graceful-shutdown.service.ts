import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from './logging.service';

@Injectable()
export class GracefulShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(GracefulShutdownService.name);
  private shutdownHandlers: Array<() => Promise<void>> = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    this.setupSignalHandlers();
  }

  async onModuleDestroy() {
    await this.shutdown();
  }

  /**
   * Register a shutdown handler
   */
  registerShutdownHandler(handler: () => Promise<void>): void {
    this.shutdownHandlers.push(handler);
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        this.logger.log(`Received ${signal}, starting graceful shutdown...`);
        await this.shutdown();
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.loggingService.logError(error, 'UncaughtException');
      this.logger.error('Uncaught Exception:', error);
      this.shutdown().then(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.loggingService.logError(
        new Error(`Unhandled Rejection: ${reason}`),
        'UnhandledRejection',
        { promise: promise.toString() },
      );
      this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.shutdown().then(() => process.exit(1));
    });
  }

  /**
   * Perform graceful shutdown
   */
  private async shutdown(): Promise<void> {
    const shutdownTimeout = this.configService.get<number>('SHUTDOWN_TIMEOUT', 10000);
    
    this.logger.log('Starting graceful shutdown...');
    this.loggingService.log('Graceful shutdown initiated', 'GracefulShutdown');

    try {
      // Set timeout for shutdown
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Shutdown timeout exceeded'));
        }, shutdownTimeout);
      });

      // Execute all shutdown handlers
      const shutdownPromise = Promise.all(
        this.shutdownHandlers.map(async (handler, index) => {
          try {
            this.logger.log(`Executing shutdown handler ${index + 1}/${this.shutdownHandlers.length}`);
            await handler();
            this.logger.log(`Shutdown handler ${index + 1} completed`);
          } catch (error) {
            this.logger.error(`Shutdown handler ${index + 1} failed:`, error);
            this.loggingService.logError(error, 'ShutdownHandler', { handlerIndex: index + 1 });
          }
        }),
      );

      // Wait for either shutdown completion or timeout
      await Promise.race([shutdownPromise, timeoutPromise]);

      this.logger.log('Graceful shutdown completed successfully');
      this.loggingService.log('Graceful shutdown completed', 'GracefulShutdown');

    } catch (error) {
      this.logger.error('Graceful shutdown failed:', error);
      this.loggingService.logError(error, 'GracefulShutdown');
    }
  }
}
