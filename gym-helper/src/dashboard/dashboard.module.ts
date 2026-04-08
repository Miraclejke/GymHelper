import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardEventsService } from './dashboard-events.service';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 15_000,
      isGlobal: true,
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardEventsService, DashboardService],
  exports: [DashboardEventsService, DashboardService],
})
export class DashboardModule {}
