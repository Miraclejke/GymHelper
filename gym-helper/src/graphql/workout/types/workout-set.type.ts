import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkoutSet', {
  description: 'Single set inside a workout exercise.',
})
export class WorkoutSetType {
  @Field(() => String, {
    description: 'Unique set identifier.',
  })
  id!: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Weight used in kilograms.',
  })
  weight?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of repetitions.',
  })
  reps?: number;
}
