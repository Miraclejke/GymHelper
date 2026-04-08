import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PlanExercise', {
  description: 'Exercise item inside the weekly workout plan.',
})
export class PlanExerciseType {
  @Field(() => String, {
    description: 'Unique exercise identifier.',
  })
  id!: string;

  @Field(() => String, {
    description: 'Exercise name.',
  })
  name!: string;

  @Field(() => String, {
    description: 'Optional note for the exercise.',
  })
  note!: string;
}
