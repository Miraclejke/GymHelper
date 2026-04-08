import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType('WorkoutSetInput', {
  description: 'Single set that can be saved into a workout exercise.',
})
export class WorkoutSetInput {
  @Field(() => Float, {
    nullable: true,
    description: 'Weight used in kilograms.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of repetitions.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reps?: number;
}

@InputType('WorkoutExerciseInput', {
  description: 'Exercise entry that can be saved into a workout day.',
})
export class WorkoutExerciseInput {
  @Field(() => String, {
    nullable: true,
    description: 'Exercise name.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => [WorkoutSetInput], {
    defaultValue: [],
    description: 'Ordered list of sets for the exercise.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSetInput)
  sets: WorkoutSetInput[] = [];
}

@InputType('SaveWorkoutDayInput', {
  description: 'Payload used to replace a full workout day.',
})
export class SaveWorkoutDayInput {
  @Field(() => [WorkoutExerciseInput], {
    defaultValue: [],
    description: 'Ordered list of exercises for the workout day.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseInput)
  exercises: WorkoutExerciseInput[] = [];
}
