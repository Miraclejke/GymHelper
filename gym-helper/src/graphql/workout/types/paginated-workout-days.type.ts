import { Field, Int, ObjectType } from '@nestjs/graphql';
import { WorkoutDayType } from './workout-day.type';

@ObjectType('PaginatedWorkoutDays', {
  description: 'Paginated collection of workout days.',
})
export class PaginatedWorkoutDaysType {
  @Field(() => [WorkoutDayType], {
    description: 'Current page of workout days.',
  })
  items!: WorkoutDayType[];

  @Field(() => Int, {
    description: 'Current page number.',
  })
  page!: number;

  @Field(() => Int, {
    description: 'Page size.',
  })
  limit!: number;

  @Field(() => Int, {
    description: 'Total number of workout days.',
  })
  total!: number;

  @Field(() => Int, {
    description: 'Total number of pages.',
  })
  totalPages!: number;
}
