import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PlanService } from '../../plan/plan.service';
import { GqlCurrentUserId } from '../decorators/gql-current-user-id.decorator';
import { WeekdayKey } from '../enums/weekday-key.enum';
import { GqlSessionAuthGuard } from '../guards/gql-session-auth.guard';
import { SavePlanDayInput } from './inputs/save-plan-day.input';
import { PlanExerciseType } from './types/plan-exercise.type';
import { WeeklyPlanType } from './types/weekly-plan.type';

@Resolver(() => WeeklyPlanType)
@UseGuards(GqlSessionAuthGuard)
export class PlanResolver {
  constructor(private readonly planService: PlanService) {}

  @Query(() => WeeklyPlanType, {
    name: 'weeklyPlan',
    description: 'Returns the full weekly workout plan for the current user.',
  })
  weeklyPlan(@GqlCurrentUserId() userId: string) {
    return this.planService.getWeek(userId);
  }

  @Query(() => [PlanExerciseType], {
    name: 'planDay',
    description: 'Returns the workout plan for a single weekday.',
  })
  planDay(
    @GqlCurrentUserId() userId: string,
    @Args('weekday', {
      type: () => WeekdayKey,
      description: 'Weekday for which the plan should be returned.',
    })
    weekday: WeekdayKey,
  ) {
    return this.planService.getDay(userId, weekday);
  }

  @Query(() => [String], {
    name: 'exerciseSuggestions',
    description: 'Returns default exercise suggestions used by the planner.',
  })
  exerciseSuggestions() {
    return this.planService.getSuggestions();
  }

  @Mutation(() => [PlanExerciseType], {
    name: 'savePlanDay',
    description: 'Replaces the workout plan for a single weekday.',
  })
  savePlanDay(
    @GqlCurrentUserId() userId: string,
    @Args('weekday', {
      type: () => WeekdayKey,
      description: 'Weekday that should be saved.',
    })
    weekday: WeekdayKey,
    @Args('input', {
      description: 'Exercises that should be stored for the weekday.',
    })
    input: SavePlanDayInput,
  ) {
    return this.planService.saveDay(userId, weekday, input.exercises ?? []);
  }
}
