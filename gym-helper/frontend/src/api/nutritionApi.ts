import type { MealEntry, NutritionDay } from '../store/types';
import { getCurrentUserData, updateCurrentUserData } from './mockDb';

const normalizeMeals = (items: MealEntry[]) =>
  items
    .map((item) => ({
      ...item,
      title: item.title.trim(),
    }))
    .filter(
      (item) =>
        item.title ||
        item.calories !== undefined ||
        item.protein !== undefined ||
        item.fat !== undefined ||
        item.carbs !== undefined
    );

export const nutritionApi = {
  async list(): Promise<Record<string, NutritionDay>> {
    return getCurrentUserData().nutrition;
  },

  async getDay(date: string): Promise<NutritionDay | null> {
    return getCurrentUserData().nutrition[date] ?? null;
  },

  async saveDay(date: string, meals: MealEntry[]): Promise<NutritionDay | null> {
    const normalized = normalizeMeals(meals);

    const nextData = updateCurrentUserData((currentData) => {
      const nextNutrition = { ...currentData.nutrition };

      if (normalized.length === 0) {
        delete nextNutrition[date];
      } else {
        nextNutrition[date] = {
          date,
          meals: normalized,
        };
      }

      return {
        ...currentData,
        nutrition: nextNutrition,
      };
    });

    return nextData.nutrition[date] ?? null;
  },
};
