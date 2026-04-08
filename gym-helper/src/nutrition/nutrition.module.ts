import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [DashboardModule],
  controllers: [NutritionController],
  providers: [NutritionService],
})
export class NutritionModule {}
