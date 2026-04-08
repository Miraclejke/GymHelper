import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkoutSetInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reps?: number;
}

export class WorkoutExerciseInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 'Bench press' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: [WorkoutSetInputDto],
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSetInputDto)
  sets: WorkoutSetInputDto[] = [];
}

export class SaveWorkoutDayDto {
  @ApiProperty({
    type: [WorkoutExerciseInputDto],
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseInputDto)
  exercises: WorkoutExerciseInputDto[] = [];
}
