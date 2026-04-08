import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { SaveWorkoutDayDto } from './dto/save-workout-day.dto';
import { WorkoutService } from './workout.service';

@Controller('api/workouts')
@UseGuards(SessionAuthGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get('suggestions')
  getSuggestions() {
    return this.workoutService.getSuggestions();
  }

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.workoutService.list(userId);
  }

  @Get(':date')
  getDay(@CurrentUserId() userId: string, @Param('date') date: string) {
    return this.workoutService.getDay(userId, date);
  }

  @Put(':date')
  saveDay(
    @CurrentUserId() userId: string,
    @Param('date') date: string,
    @Body() dto: SaveWorkoutDayDto,
  ) {
    return this.workoutService.saveDay(userId, date, dto.exercises ?? []);
  }
}
