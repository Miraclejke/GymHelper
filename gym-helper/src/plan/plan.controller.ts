import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { SavePlanDayDto } from './dto/save-plan-day.dto';
import { PlanService } from './plan.service';

@Controller('api/plan')
@UseGuards(SessionAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('suggestions')
  getSuggestions() {
    return this.planService.getSuggestions();
  }

  @Get(':weekday')
  getDay(@CurrentUserId() userId: string, @Param('weekday') weekday: string) {
    return this.planService.getDay(userId, weekday);
  }

  @Put(':weekday')
  saveDay(
    @CurrentUserId() userId: string,
    @Param('weekday') weekday: string,
    @Body() dto: SavePlanDayDto,
  ) {
    return this.planService.saveDay(userId, weekday, dto.exercises ?? []);
  }
}
