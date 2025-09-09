import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { getDatabaseConfig } from './config/database.config';

import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ExerciseLogModule } from './exercise-log/exercise-log.module';
import { SleepLogModule } from './sleep-log/sleep-log.module';
import { AIServiceModule } from './ai-service/ai-service.module';
import { SupabaseService } from './services/supabase.service';
import { AIService } from './services/ai.service';
import { DashboardService } from './services/dashboard.service';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';
import { HealthGoalService } from './services/health-goal.service';
import { FoodLogService } from './services/food-log.service';
import { OpenRouterService } from './services/openrouter.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Controllers
import { DashboardController } from './controllers/dashboard.controller';
import { ChatController } from './controllers/chat.controller';
import { UserController } from './controllers/user.controller';
import { HealthGoalController } from './controllers/health-goal.controller';
import { FoodLogController } from './controllers/food-log.controller';
import { ExerciseLogController } from './controllers/exercise-log.controller';
import { SleepLogController } from './controllers/sleep-log.controller';
import { WaterLogController } from './controllers/water-log.controller';
import { HealthMetricController } from './controllers/health-metric.controller';
import { NotificationController } from './controllers/notification.controller';
import { AIInsightController } from './controllers/ai-insight.controller';
import { UserPreferenceController } from './controllers/user-preference.controller';
import { AIController } from './controllers/ai.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    //   inject: [ConfigService],
    // }),

    AuthModule,
    ProfileModule,
    ExerciseLogModule,
    SleepLogModule,
    AIServiceModule,
  ],
  controllers: [
    DashboardController,
    ChatController,
    UserController,
    HealthGoalController,
    FoodLogController,
    ExerciseLogController,
    SleepLogController,
    WaterLogController,
    HealthMetricController,
    NotificationController,
    AIInsightController,
    UserPreferenceController,
    AIController,
    HealthController,
  ],
  providers: [
    SupabaseService,
    AIService,
    DashboardService,
    ChatService,
    UserService,
    HealthGoalService,
    FoodLogService,
    OpenRouterService,
    HttpExceptionFilter,
  ],
})
export class AppModule {}
