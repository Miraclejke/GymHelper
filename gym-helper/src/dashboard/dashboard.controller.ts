import {
  Controller,
  Get,
  MessageEvent,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { DashboardEventsService } from './dashboard-events.service';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
@UseGuards(SessionAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardEvents: DashboardEventsService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  getSummary(@CurrentUserId() userId: string) {
    return this.dashboardService.getSummary(userId);
  }

  @Sse('stream')
  stream(@CurrentUserId() userId: string): Observable<MessageEvent> {
    return this.dashboardEvents.stream(userId).pipe(
      map((payload) => ({
        data: payload,
      })),
    );
  }
}
