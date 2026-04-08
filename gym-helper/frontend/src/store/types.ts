export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type UserRole = 'user' | 'admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type PlanExercise = {
  id: string;
  name: string;
  note: string;
};

export type WorkoutSet = {
  id: string;
  weight?: number;
  reps?: number;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
};

export type WorkoutDay = {
  date: string;
  exercises: WorkoutExercise[];
};

export type MealEntry = {
  id: string;
  title: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
};

export type NutritionDay = {
  date: string;
  meals: MealEntry[];
};

export type RestDay = {
  date: string;
  isRest: boolean;
  sleepHours?: number;
  note?: string;
};
