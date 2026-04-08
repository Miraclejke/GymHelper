import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { DashboardService } from '../../dashboard/dashboard.service';
import { GqlCurrentUserId } from '../decorators/gql-current-user-id.decorator';
import { GqlSessionAuthGuard } from '../guards/gql-session-auth.guard';
import { DashboardSummaryType } from './types/dashboard-summary.type';

@Resolver(() => DashboardSummaryType)
@UseGuards(GqlSessionAuthGuard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardSummaryType, {
    name: 'dashboardSummary',
    description: 'Returns the dashboard summary for the current user.',
  })
  dashboardSummary(@GqlCurrentUserId() userId: string) {
    return this.dashboardService.getSummary(userId);
  }
}
