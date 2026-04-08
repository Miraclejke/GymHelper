import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('DashboardSummary', {
  description: 'Summary statistics for the dashboard over the last 14 days.',
})
export class DashboardSummaryType {
  @Field(() => Int, {
    description: 'Number of workout days with saved exercises.',
  })
  workoutDays!: number;

  @Field(() => Int, {
    description: 'Average number of calories consumed per tracked day.',
  })
  avgCalories!: number;

  @Field(() => Float, {
    description: 'Average number of sleep hours per tracked day.',
  })
  avgSleep!: number;
}
