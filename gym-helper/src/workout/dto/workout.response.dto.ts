import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class WorkoutSetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  weight?: number;

  @ApiPropertyOptional()
  reps?: number;
}

export class WorkoutExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [WorkoutSetResponseDto] })
  sets!: WorkoutSetResponseDto[];
}

export class WorkoutDayResponseDto {
  @ApiProperty({ example: '2026-04-08' })
  date!: string;

  @ApiProperty({ type: [WorkoutExerciseResponseDto] })
  exercises!: WorkoutExerciseResponseDto[];
}

export class PaginatedWorkoutDaysResponseDto extends PaginatedResponseDto {
  @ApiProperty({ type: [WorkoutDayResponseDto] })
  items!: WorkoutDayResponseDto[];
}
