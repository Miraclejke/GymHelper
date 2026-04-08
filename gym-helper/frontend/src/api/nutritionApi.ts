import type { MealEntry, NutritionDay } from '../store/types';
import { requestJson } from './http';
import type { PaginatedResponse } from './types';

export const nutritionApi = {
  async list(page = 1, limit = 10): Promise<PaginatedResponse<NutritionDay>> {
    return requestJson<PaginatedResponse<NutritionDay>>(
      `/api/nutrition?page=${page}&limit=${limit}`,
    );
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
