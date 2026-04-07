import type { WorkoutDay, WorkoutExercise } from '../store/types';
import { getCurrentUserData, updateCurrentUserData } from './mockDb';

const normalizeWorkoutExercises = (items: WorkoutExercise[]) =>
  items
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      sets: item.sets.filter((setItem) => setItem.weight !== undefined || setItem.reps !== undefined),
    }))
    .filter((item) => item.name || item.sets.length > 0);

export const workoutApi = {
  async getSuggestions(): Promise<string[]> {
    return getCurrentUserData().suggestions;
  },

  async list(): Promise<Record<string, WorkoutDay>> {
    return getCurrentUserData().workouts;
  },

  async getDay(date: string): Promise<WorkoutDay | null> {
    return getCurrentUserData().workouts[date] ?? null;
  },

  async saveDay(date: string, exercises: WorkoutExercise[]): Promise<WorkoutDay | null> {
    const normalized = normalizeWorkoutExercises(exercises);

    const nextData = updateCurrentUserData((currentData) => {
      const nextWorkouts = { ...currentData.workouts };

      if (normalized.length === 0) {
        delete nextWorkouts[date];
      } else {
        nextWorkouts[date] = {
          date,
          exercises: normalized,
        };
      }

      return {
        ...currentData,
        workouts: nextWorkouts,
      };
    });

    return nextData.workouts[date] ?? null;
  },
};
