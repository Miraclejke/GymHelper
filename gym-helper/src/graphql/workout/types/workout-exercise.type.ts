import { Field, ObjectType } from '@nestjs/graphql';
import { WorkoutSetType } from './workout-set.type';

@ObjectType('WorkoutExercise', {
  description: 'Exercise recorded inside a workout day.',
})
export class WorkoutExerciseType {
  @Field(() => String, {
    description: 'Unique exercise identifier.',
  })
  id!: string;

  @Field(() => String, {
    description: 'Exercise name.',
  })
  name!: string;

  @Field(() => [WorkoutSetType], {
    description: 'Sets recorded for the exercise.',
  })
  sets!: WorkoutSetType[];
}
