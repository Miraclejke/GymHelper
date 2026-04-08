import type { WorkoutDay, WorkoutExercise } from '../store/types';
import { requestJson } from './http';
import type { PaginatedResponse } from './types';

export const workoutApi = {
  async getSuggestions(): Promise<string[]> {
    return requestJson<string[]>('/api/workouts/suggestions');
  },

  async list(page = 1, limit = 10): Promise<PaginatedResponse<WorkoutDay>> {
    return requestJson<PaginatedResponse<WorkoutDay>>(
      `/api/workouts?page=${page}&limit=${limit}`,
    );
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
