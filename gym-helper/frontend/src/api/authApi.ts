import type { AuthUser } from '../store/types';
import { createUser, endSession, findUserByEmail, getCurrentUser, startSession } from './mockDb';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

const ensureValue = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`Поле "${label}" нужно заполнить.`);
  }
};

export const authApi = {
  async getCurrentUser(): Promise<AuthUser | null> {
    return getCurrentUser();
  },

  async login({ email, password }: LoginPayload): Promise<AuthUser> {
    ensureValue(email, 'Email');
    ensureValue(password, 'Пароль');

    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      throw new Error('Неверный email или пароль.');
    }

    startSession(user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  async register({ name, email, password }: RegisterPayload): Promise<AuthUser> {
    ensureValue(name, 'Имя');
    ensureValue(email, 'Email');
    ensureValue(password, 'Пароль');

    if (password.trim().length < 4) {
      throw new Error('Пароль должен быть не короче 4 символов.');
    }

    if (findUserByEmail(email)) {
      throw new Error('Пользователь с таким email уже существует.');
    }

    return createUser({ name, email, password });
  },

  async logout(): Promise<void> {
    endSession();
  },
};
