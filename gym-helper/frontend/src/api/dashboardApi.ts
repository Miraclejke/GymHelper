import { requestJson } from './http';

export type DashboardSummary = {
  workoutDays: number;
  avgCalories: number;
  avgSleep: number;
};

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    return requestJson<DashboardSummary>('/api/dashboard/summary');
  },
};
