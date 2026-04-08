import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PlanExerciseInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 'Bench press' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '5x5' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class SavePlanDayDto {
  @ApiProperty({
    type: [PlanExerciseInputDto],
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseInputDto)
  exercises: PlanExerciseInputDto[] = [];
}
