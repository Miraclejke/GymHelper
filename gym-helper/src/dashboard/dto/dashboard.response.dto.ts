import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryResponseDto {
  @ApiProperty({ example: 3 })
  workoutDays!: number;

  @ApiProperty({ example: 2100 })
  avgCalories!: number;

  @ApiProperty({ example: 7.6 })
  avgSleep!: number;
}

export class DashboardEventResponseDto {
  @ApiProperty({ example: 'workout_saved' })
  reason!: string;

  @ApiProperty({ example: 'Workout for 2026-04-08 was updated.' })
  message!: string;
}
