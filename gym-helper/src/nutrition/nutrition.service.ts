import { Injectable } from '@nestjs/common';
import {
  MealEntryResponse,
  NutritionDayResponse,
} from '../common/api.types';
import { fromDateOnly, toDateOnly } from '../common/date.util';
import { DashboardEventsService } from '../dashboard/dashboard-events.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardEvents: DashboardEventsService,
  ) {}

  async list(userId: string): Promise<Record<string, NutritionDayResponse>> {
    const days = await this.prisma.nutritionDay.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return days.reduce<Record<string, NutritionDayResponse>>((result, day) => {
      const mapped = this.mapNutritionDay(day);
      result[mapped.date] = mapped;
      return result;
    }, {});
  }

  async getDay(userId: string, date: string): Promise<NutritionDayResponse | null> {
    const day = await this.prisma.nutritionDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: toDateOnly(date),
        },
      },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return day ? this.mapNutritionDay(day) : null;
  }

  async saveDay(
    userId: string,
    date: string,
    meals: Array<{
      title?: string;
      calories?: number;
      protein?: number;
      fat?: number;
      carbs?: number;
    }>,
  ): Promise<NutritionDayResponse | null> {
    const normalized = meals
      .map((meal) => ({
        title: (meal.title ?? '').trim(),
        calories:
          typeof meal.calories === 'number' && !Number.isNaN(meal.calories)
            ? meal.calories
            : undefined,
        protein:
          typeof meal.protein === 'number' && !Number.isNaN(meal.protein)
            ? meal.protein
            : undefined,
        fat:
          typeof meal.fat === 'number' && !Number.isNaN(meal.fat)
            ? meal.fat
            : undefined,
        carbs:
          typeof meal.carbs === 'number' && !Number.isNaN(meal.carbs)
            ? meal.carbs
            : undefined,
      }))
      .filter(
        (meal) =>
          meal.title ||
          meal.calories !== undefined ||
          meal.protein !== undefined ||
          meal.fat !== undefined ||
          meal.carbs !== undefined,
      );

    const dateOnly = toDateOnly(date);

    if (normalized.length === 0) {
      await this.prisma.nutritionDay.deleteMany({
        where: {
          userId,
          date: dateOnly,
        },
      });

      this.dashboardEvents.publish(userId, {
        reason: 'nutrition_deleted',
        message: `Nutrition for ${date} was removed.`,
      });

      return null;
    }

    const day = await this.prisma.nutritionDay.upsert({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      create: {
        userId,
        date: dateOnly,
        meals: {
          create: normalized.map((meal, index) => ({
            sortOrder: index + 1,
            title: meal.title,
            calories: meal.calories,
            protein: meal.protein,
            fat: meal.fat,
            carbs: meal.carbs,
          })),
        },
      },
      update: {
        meals: {
          deleteMany: {},
          create: normalized.map((meal, index) => ({
            sortOrder: index + 1,
            title: meal.title,
            calories: meal.calories,
            protein: meal.protein,
            fat: meal.fat,
            carbs: meal.carbs,
          })),
        },
      },
      include: {
        meals: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    this.dashboardEvents.publish(userId, {
      reason: 'nutrition_saved',
      message: `Nutrition for ${date} was updated.`,
    });

    return this.mapNutritionDay(day);
  }

  private mapNutritionDay(day: {
    date: Date;
    meals: Array<{
      id: string;
      title: string;
      calories: number | null;
      protein: number | null;
      fat: number | null;
      carbs: number | null;
    }>;
  }): NutritionDayResponse {
    return {
      date: fromDateOnly(day.date),
      meals: day.meals.map<MealEntryResponse>((meal) => ({
        id: meal.id,
        title: meal.title,
        calories: meal.calories ?? undefined,
        protein: meal.protein ?? undefined,
        fat: meal.fat ?? undefined,
        carbs: meal.carbs ?? undefined,
      })),
    };
  }
}
