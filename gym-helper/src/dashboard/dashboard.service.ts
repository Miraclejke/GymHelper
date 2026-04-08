import { Injectable } from '@nestjs/common';
import { DashboardSummaryResponse } from '../common/api.types';
import { PrismaService } from '../prisma/prisma.service';

const DAYS_RANGE = 14;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string): Promise<DashboardSummaryResponse> {
    const startDate = this.getRangeStartDate(DAYS_RANGE);

    const [workoutDays, nutritionDays, restDays] = await Promise.all([
      this.prisma.workoutDay.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
          },
        },
        include: {
          exercises: true,
        },
      }),
      this.prisma.nutritionDay.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
          },
        },
        include: {
          meals: true,
        },
      }),
      this.prisma.restDay.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
          },
        },
      }),
    ]);

    const workoutCount = workoutDays.filter(
      (day) => day.exercises.length > 0,
    ).length;

    let caloriesSum = 0;
    let caloriesDays = 0;

    nutritionDays.forEach((day) => {
      const dayCalories = day.meals.reduce(
        (total, meal) =>
          meal.calories !== null ? total + meal.calories : total,
        0,
      );

      if (day.meals.some((meal) => meal.calories !== null)) {
        caloriesSum += dayCalories;
        caloriesDays += 1;
      }
    });

    let sleepSum = 0;
    let sleepDays = 0;

    restDays.forEach((day) => {
      if (day.sleepHours !== null) {
        sleepSum += day.sleepHours;
        sleepDays += 1;
      }
    });

    return {
      workoutDays: workoutCount,
      avgCalories: caloriesDays ? Math.round(caloriesSum / caloriesDays) : 0,
      avgSleep: sleepDays ? Math.round((sleepSum / sleepDays) * 10) / 10 : 0,
    };
  }

  private getRangeStartDate(days: number) {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    start.setDate(start.getDate() - (days - 1));
    return start;
  }
}
