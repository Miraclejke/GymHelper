import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardEventsService } from './dashboard-events.service';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardEventsService, DashboardService],
  exports: [DashboardEventsService, DashboardService],
})
export class DashboardModule {}
