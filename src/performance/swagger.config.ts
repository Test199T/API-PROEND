import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: any) {
  const config = new DocumentBuilder()
    .setTitle('Health API - Performance Optimized')
    .setDescription(`
      ## Health & Wellness API with Performance Optimization
      
      This API provides comprehensive health tracking and AI-powered insights with the following performance features:
      
      ### 🚀 Performance Features
      - **Rate Limiting**: 100 requests per minute per IP
      - **Response Compression**: Gzip compression for responses > 1KB
      - **Caching**: Redis-based caching for frequently accessed data
      - **Security Headers**: Helmet.js security headers
      - **Health Monitoring**: Comprehensive health checks
      - **Metrics**: Prometheus metrics for monitoring
      
      ### 📊 Health Endpoints
      - \`GET /api/health\` - Basic health check
      - \`GET /api/health/detailed\` - Detailed system information
      - \`GET /api/health/ready\` - Readiness probe
      - \`GET /api/health/live\` - Liveness probe
      
      ### 📈 Monitoring
      - \`GET /api/metrics\` - Prometheus metrics (if enabled)
      
      ### 🔒 Security
      - Rate limiting applied to all endpoints
      - Security headers (CSP, HSTS, X-Frame-Options, etc.)
      - CORS configured for allowed origins
      
      ### ⚡ Performance Tips
      - Use \`X-Skip-Cache\` header to bypass caching when needed
      - Monitor rate limit headers in responses
      - Check health endpoints for system status
    `)
    .setVersion('1.0.0')
    .addTag('Health', 'Health check and monitoring endpoints')
    .addTag('Performance', 'Performance monitoring and metrics')
    .addTag('Auth', 'Authentication and user management')
    .addTag('Profile', 'User profile management')
    .addTag('Exercise', 'Exercise logging and tracking')
    .addTag('Sleep', 'Sleep logging and analysis')
    .addTag('AI', 'AI-powered health insights')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.health-app.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Add custom schemas for performance features
  document.components = {
    ...document.components,
    schemas: {
      ...document.components?.schemas,
      HealthStatus: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['ok', 'error'],
            description: 'Overall health status',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Health check timestamp',
          },
          uptime: {
            type: 'number',
            description: 'Application uptime in seconds',
          },
          environment: {
            type: 'string',
            description: 'Current environment',
          },
          version: {
            type: 'string',
            description: 'Application version',
          },
          services: {
            type: 'object',
            description: 'Status of various services',
            properties: {
              api: {
                type: 'string',
                enum: ['healthy', 'unhealthy'],
              },
              cache: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['healthy', 'unhealthy'],
                  },
                  type: {
                    type: 'string',
                    description: 'Cache type (redis, memory)',
                  },
                },
              },
              metrics: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['healthy', 'disabled'],
                  },
                  type: {
                    type: 'string',
                    description: 'Metrics type (prometheus)',
                  },
                },
              },
            },
          },
        },
      },
      DetailedHealthStatus: {
        allOf: [
          { $ref: '#/components/schemas/HealthStatus' },
          {
            type: 'object',
            properties: {
              system: {
                type: 'object',
                properties: {
                  memory: {
                    type: 'object',
                    properties: {
                      rss: { type: 'string' },
                      heapTotal: { type: 'string' },
                      heapUsed: { type: 'string' },
                      external: { type: 'string' },
                    },
                  },
                  cpu: {
                    type: 'object',
                    properties: {
                      user: { type: 'number' },
                      system: { type: 'number' },
                    },
                  },
                  platform: { type: 'string' },
                  arch: { type: 'string' },
                  nodeVersion: { type: 'string' },
                },
              },
              configuration: {
                type: 'object',
                properties: {
                  rateLimiting: {
                    type: 'object',
                    properties: {
                      enabled: { type: 'boolean' },
                      ttl: { type: 'number' },
                      limit: { type: 'number' },
                    },
                  },
                  compression: {
                    type: 'object',
                    properties: {
                      enabled: { type: 'boolean' },
                      level: { type: 'number' },
                      threshold: { type: 'number' },
                    },
                  },
                  security: {
                    type: 'object',
                    properties: {
                      helmet: {
                        type: 'object',
                        properties: {
                          csp: { type: 'boolean' },
                          hsts: { type: 'boolean' },
                        },
                      },
                    },
                  },
                  monitoring: {
                    type: 'object',
                    properties: {
                      prometheus: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      MetricsResponse: {
        type: 'string',
        description: 'Prometheus metrics in text format',
        example: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/health",status_code="200"} 10`,
      },
      RateLimitInfo: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum requests allowed per window',
          },
          remaining: {
            type: 'number',
            description: 'Remaining requests in current window',
          },
          reset: {
            type: 'number',
            description: 'Unix timestamp when the rate limit resets',
          },
          retryAfter: {
            type: 'number',
            description: 'Seconds to wait before retrying (when rate limited)',
          },
        },
      },
    },
  };

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'Health API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
  });

  return document;
}
