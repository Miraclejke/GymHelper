import type { WorkoutDay, WorkoutExercise } from '../store/types';
import { requestJson } from './http';

export const workoutApi = {
  async getSuggestions(): Promise<string[]> {
    return requestJson<string[]>('/api/workouts/suggestions');
  },

  async list(): Promise<Record<string, WorkoutDay>> {
    return requestJson<Record<string, WorkoutDay>>('/api/workouts');
  },

  async getDay(date: string): Promise<WorkoutDay | null> {
    return requestJson<WorkoutDay | null>(`/api/workouts/${date}`);
  },

  async saveDay(date: string, exercises: WorkoutExercise[]): Promise<WorkoutDay | null> {
    return requestJson<WorkoutDay | null>(`/api/workouts/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ exercises }),
    });
  },
};
