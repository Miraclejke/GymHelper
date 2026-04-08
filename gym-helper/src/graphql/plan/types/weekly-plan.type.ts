import { Field, ObjectType } from '@nestjs/graphql';
import { PlanExerciseType } from './plan-exercise.type';

@ObjectType('WeeklyPlan', {
  description: 'Full weekly workout plan grouped by weekday.',
})
export class WeeklyPlanType {
  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Monday.',
  })
  mon!: PlanExerciseType[];

  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Tuesday.',
  })
  tue!: PlanExerciseType[];

  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Wednesday.',
  })
  wed!: PlanExerciseType[];

  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Thursday.',
  })
  thu!: PlanExerciseType[];

  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Friday.',
  })
  fri!: PlanExerciseType[];

  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Saturday.',
  })
  sat!: PlanExerciseType[];

  @Field(() => [PlanExerciseType], {
    description: 'Exercises planned for Sunday.',
  })
  sun!: PlanExerciseType[];
}
