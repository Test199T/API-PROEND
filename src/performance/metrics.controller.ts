import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';
import { ConfigService } from '@nestjs/config';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const isEnabled = this.configService.get<boolean>('performance.monitoring.prometheusEnabled', false);
    
    if (!isEnabled) {
      res.status(404).json({ message: 'Metrics not enabled' });
      return;
    }

    try {
      const metrics = await this.metricsService.getMetrics();
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve metrics' });
    }
  }
}
