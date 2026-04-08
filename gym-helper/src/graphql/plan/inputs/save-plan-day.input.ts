import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('PlanExerciseInput', {
  description: 'Exercise entry that can be saved into a plan day.',
})
export class PlanExerciseInput {
  @Field(() => String, {
    nullable: true,
    description: 'Exercise name.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional note for the exercise.',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

@InputType('SavePlanDayInput', {
  description: 'Payload used to replace a full plan day.',
})
export class SavePlanDayInput {
  @Field(() => [PlanExerciseInput], {
    defaultValue: [],
    description: 'Ordered list of exercises for the selected weekday.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseInput)
  exercises: PlanExerciseInput[] = [];
}
