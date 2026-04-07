import type { PlanExercise, WeekdayKey } from '../store/types';
import { getCurrentUserData, updateCurrentUserData } from './mockDb';

const normalizePlanExercises = (items: PlanExercise[]) =>
  items
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      note: item.note.trim(),
    }))
    .filter((item) => item.name || item.note);

export const planApi = {
  async getSuggestions(): Promise<string[]> {
    return getCurrentUserData().suggestions;
  },

  async getDay(day: WeekdayKey): Promise<PlanExercise[]> {
    const data = getCurrentUserData();
    return data.weeklyPlan[day] ?? [];
  },

  async saveDay(day: WeekdayKey, exercises: PlanExercise[]): Promise<PlanExercise[]> {
    const normalized = normalizePlanExercises(exercises);
    const nextData = updateCurrentUserData((currentData) => ({
      ...currentData,
      weeklyPlan: {
        ...currentData.weeklyPlan,
        [day]: normalized,
      },
    }));

    return nextData.weeklyPlan[day] ?? [];
  },
};
