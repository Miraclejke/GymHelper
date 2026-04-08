import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import {
  PaginatedResponse,
  WorkoutDayResponse,
  WorkoutExerciseResponse,
  WorkoutSetResponse,
} from '../common/api.types';
import { fromDateOnly, toDateOnly } from '../common/date.util';
import { buildPaginatedResponse } from '../common/pagination.util';
import { DEFAULT_EXERCISE_SUGGESTIONS } from '../common/suggestions';
import { getDashboardSummaryCacheKey } from '../dashboard/dashboard.cache';
import { DashboardEventsService } from '../dashboard/dashboard-events.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkoutService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly dashboardEvents: DashboardEventsService,
  ) {}

  getSuggestions() {
    return DEFAULT_EXERCISE_SUGGESTIONS;
  }

  async list(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<WorkoutDayResponse>> {
    const skip = (page - 1) * limit;
    const [total, days] = await Promise.all([
      this.prisma.workoutDay.count({
        where: { userId },
      }),
      this.prisma.workoutDay.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          exercises: {
            orderBy: { sortOrder: 'asc' },
            include: {
              sets: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      }),
    ]);

    return buildPaginatedResponse(
      days.map((day) => this.mapWorkoutDay(day)),
      page,
      limit,
      total,
    );
  }

  async getDay(
    userId: string,
    date: string,
  ): Promise<WorkoutDayResponse | null> {
    const day = await this.prisma.workoutDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: toDateOnly(date),
        },
      },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: {
            sets: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    return day ? this.mapWorkoutDay(day) : null;
  }

  async saveDay(
    userId: string,
    date: string,
    exercises: Array<{
      name?: string;
      sets?: Array<{ weight?: number; reps?: number }>;
    }>,
  ): Promise<WorkoutDayResponse | null> {
    const normalized = exercises
      .map((exercise) => ({
        name: (exercise.name ?? '').trim(),
        sets: (exercise.sets ?? [])
          .map((set) => ({
            weight:
              typeof set.weight === 'number' && !Number.isNaN(set.weight)
                ? set.weight
                : undefined,
            reps:
              typeof set.reps === 'number' && !Number.isNaN(set.reps)
                ? set.reps
                : undefined,
          }))
          .filter((set) => set.weight !== undefined || set.reps !== undefined),
      }))
      .filter((exercise) => exercise.name || exercise.sets.length > 0);

    const dateOnly = toDateOnly(date);

    if (normalized.length === 0) {
      await this.prisma.workoutDay.deleteMany({
        where: {
          userId,
          date: dateOnly,
        },
      });
      await this.cacheManager.del(getDashboardSummaryCacheKey(userId));

      this.dashboardEvents.publish(userId, {
        reason: 'workout_deleted',
        message: `Workout for ${date} was removed.`,
      });

      return null;
    }

    const day = await this.prisma.workoutDay.upsert({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      create: {
        userId,
        date: dateOnly,
        exercises: {
          create: normalized.map((exercise, exerciseIndex) => ({
            sortOrder: exerciseIndex + 1,
            name: exercise.name,
            sets: {
              create: exercise.sets.map((set, setIndex) => ({
                sortOrder: setIndex + 1,
                weight: set.weight,
                reps: set.reps,
              })),
            },
          })),
        },
      },
      update: {
        exercises: {
          deleteMany: {},
          create: normalized.map((exercise, exerciseIndex) => ({
            sortOrder: exerciseIndex + 1,
            name: exercise.name,
            sets: {
              create: exercise.sets.map((set, setIndex) => ({
                sortOrder: setIndex + 1,
                weight: set.weight,
                reps: set.reps,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: {
            sets: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
    await this.cacheManager.del(getDashboardSummaryCacheKey(userId));

    this.dashboardEvents.publish(userId, {
      reason: 'workout_saved',
      message: `Workout for ${date} was updated.`,
    });

    return this.mapWorkoutDay(day);
  }

  private mapWorkoutDay(day: {
    date: Date;
    exercises: Array<{
      id: string;
      name: string;
      sets: Array<{
        id: string;
        weight: number | null;
        reps: number | null;
      }>;
    }>;
  }): WorkoutDayResponse {
    return {
      date: fromDateOnly(day.date),
      exercises: day.exercises.map<WorkoutExerciseResponse>((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map<WorkoutSetResponse>((set) => ({
          id: set.id,
          weight: set.weight ?? undefined,
          reps: set.reps ?? undefined,
        })),
      })),
    };
  }
}
