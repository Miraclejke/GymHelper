import { Controller, Get, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { DashboardEventsService } from './dashboard-events.service';
import {
  DashboardEventResponseDto,
  DashboardSummaryResponseDto,
} from './dto/dashboard.response.dto';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
@UseGuards(SessionAuthGuard)
@ApiTags('dashboard')
@ApiCookieAuth('session')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
export class DashboardController {
  constructor(
    private readonly dashboardEvents: DashboardEventsService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary for the last 14 days.' })
  @ApiOkResponse({ type: DashboardSummaryResponseDto })
  getSummary(@CurrentUserId() userId: string) {
    return this.dashboardService.getSummary(userId);
  }

  @Sse('stream')
  @ApiOperation({
    summary: 'Subscribe to dashboard updates via Server-Sent Events.',
  })
  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    description: 'SSE stream of dashboard update events.',
    type: DashboardEventResponseDto,
  })
  stream(@CurrentUserId() userId: string): Observable<MessageEvent> {
    return this.dashboardEvents.stream(userId).pipe(
      map((payload) => ({
        data: payload,
      })),
    );
  }
}
