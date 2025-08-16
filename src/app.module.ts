import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './form/form.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseService } from './services/supabase.service';
import { AIService } from './services/ai.service';
import { DashboardService } from './services/dashboard.service';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';
import { HealthGoalService } from './services/health-goal.service';

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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FormModule,
    AuthModule,
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
  ],
  providers: [
    SupabaseService,
    AIService,
    DashboardService,
    ChatService,
    UserService,
    HealthGoalService,
  ],
})
export class AppModule {}
