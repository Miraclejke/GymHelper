import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WorkoutService } from '../../workout/workout.service';
import { PaginationArgs } from '../common/pagination.args';
import { GqlCurrentUserId } from '../decorators/gql-current-user-id.decorator';
import { GqlSessionAuthGuard } from '../guards/gql-session-auth.guard';
import { SaveWorkoutDayInput } from './inputs/save-workout-day.input';
import { PaginatedWorkoutDaysType } from './types/paginated-workout-days.type';
import { WorkoutDayType } from './types/workout-day.type';
import { WorkoutExerciseType } from './types/workout-exercise.type';
import { WorkoutSetType } from './types/workout-set.type';

@Resolver(() => WorkoutDayType)
@UseGuards(GqlSessionAuthGuard)
export class WorkoutResolver {
  constructor(private readonly workoutService: WorkoutService) {}

  @Query(() => WorkoutDayType, {
    name: 'workoutDay',
    nullable: true,
    description: 'Returns the workout log for a single date.',
  })
  workoutDay(
    @GqlCurrentUserId() userId: string,
    @Args('date', {
      description: 'Date in YYYY-MM-DD format.',
    })
    date: string,
  ) {
    return this.workoutService.getDay(userId, date);
  }

  @Query(() => PaginatedWorkoutDaysType, {
    name: 'workouts',
    description: 'Returns paginated workout logs for the current user.',
  })
  workouts(@GqlCurrentUserId() userId: string, @Args() args: PaginationArgs) {
    return this.workoutService.list(userId, args.page, args.limit);
  }

  @Mutation(() => WorkoutDayType, {
    name: 'saveWorkoutDay',
    nullable: true,
    description:
      'Creates, updates or removes the workout log for a single date.',
  })
  saveWorkoutDay(
    @GqlCurrentUserId() userId: string,
    @Args('date', {
      description: 'Date in YYYY-MM-DD format.',
    })
    date: string,
    @Args('input', {
      description: 'Exercises that should be stored for the date.',
    })
    input: SaveWorkoutDayInput,
  ) {
    return this.workoutService.saveDay(userId, date, input.exercises ?? []);
  }
}

@Resolver(() => WorkoutDayType)
export class WorkoutDayFieldResolver {
  @ResolveField(() => [WorkoutExerciseType], {
    description: 'Exercises stored for the workout day.',
  })
  exercises(@Parent() workoutDay: WorkoutDayType) {
    return workoutDay.exercises ?? [];
  }
}

@Resolver(() => WorkoutExerciseType)
export class WorkoutExerciseFieldResolver {
  @ResolveField(() => [WorkoutSetType], {
    description: 'Sets stored for the workout exercise.',
  })
  sets(@Parent() exercise: WorkoutExerciseType) {
    return exercise.sets ?? [];
  }
}
