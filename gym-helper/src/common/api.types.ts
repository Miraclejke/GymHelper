export type UserRoleValue = 'user' | 'admin';
export type WeekdayValue =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRoleValue;
};

export type AdminUserResponse = AuthUserResponse & {
  createdAt: string;
};

export type PlanExerciseResponse = {
  id: string;
  name: string;
  note: string;
};

export type WeeklyPlanResponse = Record<WeekdayValue, PlanExerciseResponse[]>;

export type WorkoutSetResponse = {
  id: string;
  weight?: number;
  reps?: number;
};

export type WorkoutExerciseResponse = {
  id: string;
  name: string;
  sets: WorkoutSetResponse[];
};

export type WorkoutDayResponse = {
  date: string;
  exercises: WorkoutExerciseResponse[];
};

export type MealEntryResponse = {
  id: string;
  title: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
};

export type NutritionDayResponse = {
  date: string;
  meals: MealEntryResponse[];
};

export type RestDayResponse = {
  date: string;
  isRest: boolean;
  sleepHours?: number;
  note?: string;
};

export type DashboardEventResponse = {
  reason: string;
  message: string;
};

export type DashboardSummaryResponse = {
  workoutDays: number;
  avgCalories: number;
  avgSleep: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
