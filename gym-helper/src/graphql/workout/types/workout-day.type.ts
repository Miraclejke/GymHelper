import { Field, ObjectType } from '@nestjs/graphql';
import { WorkoutExerciseType } from './workout-exercise.type';

@ObjectType('WorkoutDay', {
  description: 'Workout log for a specific date.',
})
export class WorkoutDayType {
  @Field(() => String, {
    description: 'Workout date in YYYY-MM-DD format.',
  })
  date!: string;

  @Field(() => [WorkoutExerciseType], {
    description: 'Exercises saved for the date.',
  })
  exercises!: WorkoutExerciseType[];
}
