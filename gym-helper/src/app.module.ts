import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { PlanModule } from './plan/plan.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestModule } from './rest/rest.module';
import { WorkoutModule } from './workout/workout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    PlanModule,
    WorkoutModule,
    NutritionModule,
    RestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
