import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): any => {
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  
  return {
    type: 'postgres',
    host: configService.get('SUPABASE_DB_HOST') || 'db.supabase.co',
    port: parseInt(configService.get('SUPABASE_DB_PORT') || '5432'),
    username: configService.get('SUPABASE_DB_USER') || 'postgres',
    password: configService.get('SUPABASE_DB_PASSWORD'),
    database: configService.get('SUPABASE_DB_NAME') || 'postgres',
    ssl: {
      rejectUnauthorized: false,
    },
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: nodeEnv === 'development',
    logging: nodeEnv === 'development',
    autoLoadEntities: true,
    extra: {
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    },
  };
};

export const getSupabaseConfig = (configService: ConfigService) => {
  return {
    url: configService.get('SUPABASE_URL'),
    anonKey: configService.get('SUPABASE_ANON_KEY'),
    serviceRoleKey: configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    jwtSecret: configService.get('SUPABASE_JWT_SECRET'),
  };
};

// Database connection string for direct connection
export const getDatabaseUrl = (configService: ConfigService): string => {
  const host = configService.get('SUPABASE_DB_HOST') || 'db.supabase.co';
  const port = configService.get('SUPABASE_DB_PORT') || 5432;
  const username = configService.get('SUPABASE_DB_USER') || 'postgres';
  const password = configService.get('SUPABASE_DB_PASSWORD');
  const database = configService.get('SUPABASE_DB_NAME') || 'postgres';

  return `postgresql://${username}:${password}@${host}:${port}/${database}?sslmode=require`;
};

// Environment validation
export const validateDatabaseConfig = (
  configService: ConfigService,
): boolean => {
  const requiredKeys = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_DB_PASSWORD',
  ];

  const missingKeys = requiredKeys.filter((key) => !configService.get(key));

  if (missingKeys.length > 0) {
    console.error('Missing required environment variables:', missingKeys);
    return false;
  }

  return true;
};

// Database health check
export const checkDatabaseConnection = async (
  configService: ConfigService,
): Promise<boolean> => {
  try {
    // TODO: Implement actual database connection test
    const config = getDatabaseConfig(configService);
    console.log('Database configuration loaded successfully');
    return true;
  } catch (error) {
    console.error('Database configuration error:', error);
    return false;
  }
};
