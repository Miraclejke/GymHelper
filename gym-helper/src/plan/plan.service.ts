import { Injectable } from '@nestjs/common';
import { PlanExerciseResponse, WeeklyPlanResponse } from '../common/api.types';
import { DEFAULT_EXERCISE_SUGGESTIONS } from '../common/suggestions';
import { fromWeekday, WEEKDAY_ORDER, toWeekday } from '../common/weekday.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  getSuggestions() {
    return DEFAULT_EXERCISE_SUGGESTIONS;
  }

  async getWeek(userId: string): Promise<WeeklyPlanResponse> {
    const days = await this.prisma.planDay.findMany({
      where: { userId },
      include: {
        exercises: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    const result = WEEKDAY_ORDER.reduce<WeeklyPlanResponse>(
      (week, weekday) => {
        week[weekday] = [];
        return week;
      },
      {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
      },
    );

    days.forEach((day) => {
      result[fromWeekday(day.weekday)] = this.mapExercises(day.exercises);
    });

    return result;
  }

  async getDay(
    userId: string,
    weekdayKey: string,
  ): Promise<PlanExerciseResponse[]> {
    const weekday = toWeekday(weekdayKey);
    const day = await this.prisma.planDay.findUnique({
      where: {
        userId_weekday: {
          userId,
          weekday,
        },
      },
      include: {
        exercises: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!day) {
      return [];
    }

    return this.mapExercises(day.exercises);
  }

  async saveDay(
    userId: string,
    weekdayKey: string,
    exercises: Array<{ name?: string; note?: string }>,
  ): Promise<PlanExerciseResponse[]> {
    const weekday = toWeekday(weekdayKey);
    const normalized = exercises
      .map((exercise) => ({
        name: (exercise.name ?? '').trim(),
        note: (exercise.note ?? '').trim(),
      }))
      .filter((exercise) => exercise.name || exercise.note);

    if (normalized.length === 0) {
      await this.prisma.planDay.deleteMany({
        where: {
          userId,
          weekday,
        },
      });

      return [];
    }

    const day = await this.prisma.planDay.upsert({
      where: {
        userId_weekday: {
          userId,
          weekday,
        },
      },
      create: {
        userId,
        weekday,
        exercises: {
          create: normalized.map((exercise, index) => ({
            sortOrder: index + 1,
            name: exercise.name,
            note: exercise.note,
          })),
        },
      },
      update: {
        exercises: {
          deleteMany: {},
          create: normalized.map((exercise, index) => ({
            sortOrder: index + 1,
            name: exercise.name,
            note: exercise.note,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return this.mapExercises(day.exercises);
  }

  private mapExercises(
    exercises: Array<{ id: string; name: string; note: string }>,
  ): PlanExerciseResponse[] {
    return exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      note: exercise.note,
    }));
  }
}
