import type { PlanExercise, WeekdayKey } from '../store/types';
import { requestJson } from './http';

export const planApi = {
  async getSuggestions(): Promise<string[]> {
    return requestJson<string[]>('/api/plan/suggestions');
  },

  async getDay(day: WeekdayKey): Promise<PlanExercise[]> {
    return requestJson<PlanExercise[]>(`/api/plan/${day}`);
  },

  async saveDay(day: WeekdayKey, exercises: PlanExercise[]): Promise<PlanExercise[]> {
    return requestJson<PlanExercise[]>(`/api/plan/${day}`, {
      method: 'PUT',
      body: JSON.stringify({ exercises }),
    });
  },
};
