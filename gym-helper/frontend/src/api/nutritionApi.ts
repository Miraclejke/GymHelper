import type { MealEntry, NutritionDay } from '../store/types';
import { requestJson } from './http';

export const nutritionApi = {
  async list(): Promise<Record<string, NutritionDay>> {
    return requestJson<Record<string, NutritionDay>>('/api/nutrition');
  },

  async getDay(date: string): Promise<NutritionDay | null> {
    return requestJson<NutritionDay | null>(`/api/nutrition/${date}`);
  },

  async saveDay(date: string, meals: MealEntry[]): Promise<NutritionDay | null> {
    return requestJson<NutritionDay | null>(`/api/nutrition/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ meals }),
    });
  },
};
