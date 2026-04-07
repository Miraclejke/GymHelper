import { createId } from '../utils/id';
import type {
  AppDataState,
  AuthUser,
  NutritionDay,
  PlanExercise,
  RestDay,
  UserRole,
  WeekdayKey,
  WorkoutDay,
} from '../store/types';

const LOCAL_DB_KEY = 'gymhelper-local-db-v1';

type StoredUser = AuthUser & {
  password: string;
};

type LocalDb = {
  users: StoredUser[];
  currentUserId: string | null;
  userData: Record<string, AppDataState>;
};

const DEFAULT_SUGGESTIONS = [
  'Жим лежа',
  'Приседания',
  'Становая тяга',
  'Жим стоя',
  'Подтягивания',
  'Тяга в наклоне',
  'Выпады',
  'Жим ногами',
  'Сгибание рук',
  'Разгибание рук',
];

const WEEK_DAYS: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const toAuthUser = ({ password: _password, ...user }: StoredUser): AuthUser => user;

const createWeeklyPlan = (): Record<WeekdayKey, PlanExercise[]> =>
  WEEK_DAYS.reduce(
    (result, day) => ({
      ...result,
      [day]: [],
    }),
    {} as Record<WeekdayKey, PlanExercise[]>
  );

export const createEmptyAppData = (): AppDataState => ({
  weeklyPlan: createWeeklyPlan(),
  workouts: {},
  nutrition: {},
  rest: {},
  suggestions: [...DEFAULT_SUGGESTIONS],
});

const createSeedAdmin = (): StoredUser => ({
  id: createId('user'),
  name: 'Admin',
  email: 'admin@gymhelper.local',
  password: 'admin123',
  role: 'admin',
});

const createInitialDb = (): LocalDb => {
  const admin = createSeedAdmin();

  return {
    users: [admin],
    currentUserId: null,
    userData: {
      [admin.id]: createEmptyAppData(),
    },
  };
};

const isRole = (value: string): value is UserRole => value === 'user' || value === 'admin';

const isStoredUser = (value: StoredUser | null): value is StoredUser => value !== null;

const normalizeUser = (user: Partial<StoredUser>): StoredUser | null => {
  if (
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    typeof user.password !== 'string' ||
    typeof user.role !== 'string' ||
    !isRole(user.role)
  ) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  };
};

const normalizeWorkoutRecord = (value: unknown): Record<string, WorkoutDay> =>
  value && typeof value === 'object' ? (value as Record<string, WorkoutDay>) : {};

const normalizeNutritionRecord = (value: unknown): Record<string, NutritionDay> =>
  value && typeof value === 'object' ? (value as Record<string, NutritionDay>) : {};

const normalizeRestRecord = (value: unknown): Record<string, RestDay> =>
  value && typeof value === 'object' ? (value as Record<string, RestDay>) : {};

const normalizeAppData = (value: Partial<AppDataState> | undefined): AppDataState => ({
  weeklyPlan:
    value?.weeklyPlan && typeof value.weeklyPlan === 'object'
      ? {
          ...createWeeklyPlan(),
          ...(value.weeklyPlan as Record<WeekdayKey, PlanExercise[]>),
        }
      : createWeeklyPlan(),
  workouts: normalizeWorkoutRecord(value?.workouts),
  nutrition: normalizeNutritionRecord(value?.nutrition),
  rest: normalizeRestRecord(value?.rest),
  suggestions:
    Array.isArray(value?.suggestions) && value?.suggestions.length > 0
      ? [...value.suggestions]
      : [...DEFAULT_SUGGESTIONS],
});

const normalizeDb = (value: unknown): LocalDb => {
  if (!value || typeof value !== 'object') {
    return createInitialDb();
  }

  const maybeDb = value as Partial<LocalDb>;
  const users = Array.isArray(maybeDb.users)
    ? maybeDb.users.map((user) => normalizeUser(user)).filter(isStoredUser)
    : [];

  if (users.length === 0) {
    return createInitialDb();
  }

  const currentUserId =
    typeof maybeDb.currentUserId === 'string' || maybeDb.currentUserId === null
      ? maybeDb.currentUserId
      : null;

  const userData = users.reduce<Record<string, AppDataState>>((result, user) => {
    const source =
      maybeDb.userData && typeof maybeDb.userData === 'object'
        ? (maybeDb.userData[user.id] as Partial<AppDataState> | undefined)
        : undefined;

    result[user.id] = normalizeAppData(source);
    return result;
  }, {});

  return {
    users,
    currentUserId,
    userData,
  };
};

export const readDb = (): LocalDb => {
  const raw = window.localStorage.getItem(LOCAL_DB_KEY);

  if (!raw) {
    const db = createInitialDb();
    writeDb(db);
    return db;
  }

  try {
    return normalizeDb(JSON.parse(raw));
  } catch {
    const db = createInitialDb();
    writeDb(db);
    return db;
  }
};

export const writeDb = (db: LocalDb) => {
  window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
};

export const getCurrentUser = (): AuthUser | null => {
  const db = readDb();
  const user = db.users.find((item) => item.id === db.currentUserId);
  return user ? toAuthUser(user) : null;
};

export const findUserByEmail = (email: string): StoredUser | null => {
  const normalizedEmail = email.trim().toLowerCase();
  const db = readDb();
  return db.users.find((item) => item.email === normalizedEmail) ?? null;
};

export const createUser = (params: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): AuthUser => {
  const db = readDb();

  const newUser: StoredUser = {
    id: createId('user'),
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    password: params.password,
    role: params.role ?? 'user',
  };

  db.users.push(newUser);
  db.userData[newUser.id] = createEmptyAppData();
  db.currentUserId = newUser.id;

  writeDb(db);
  return toAuthUser(newUser);
};

export const startSession = (userId: string) => {
  const db = readDb();
  db.currentUserId = userId;
  writeDb(db);
};

export const endSession = () => {
  const db = readDb();
  db.currentUserId = null;
  writeDb(db);
};

export const getCurrentUserData = (): AppDataState => {
  const db = readDb();
  const currentUser = db.users.find((user) => user.id === db.currentUserId);

  if (!currentUser) {
    throw new Error('Нужно войти в аккаунт.');
  }

  return clone(db.userData[currentUser.id] ?? createEmptyAppData());
};

export const updateCurrentUserData = (
  updater: (currentData: AppDataState) => AppDataState
): AppDataState => {
  const db = readDb();
  const currentUser = db.users.find((user) => user.id === db.currentUserId);

  if (!currentUser) {
    throw new Error('Нужно войти в аккаунт.');
  }

  const nextData = updater(clone(db.userData[currentUser.id] ?? createEmptyAppData()));
  db.userData[currentUser.id] = normalizeAppData(nextData);
  writeDb(db);

  return clone(db.userData[currentUser.id]);
};
