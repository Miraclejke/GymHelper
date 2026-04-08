import { ApiProperty } from '@nestjs/swagger';

export class PlanExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  note!: string;
}

export class WeeklyPlanResponseDto {
  @ApiProperty({ type: [PlanExerciseResponseDto] })
  mon!: PlanExerciseResponseDto[];

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  tue!: PlanExerciseResponseDto[];

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  wed!: PlanExerciseResponseDto[];

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  thu!: PlanExerciseResponseDto[];

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  fri!: PlanExerciseResponseDto[];

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  sat!: PlanExerciseResponseDto[];

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  sun!: PlanExerciseResponseDto[];
}
