import type { AuthUser } from '../store/types';
import { requestJson } from './http';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from './types';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export const authApi = {
  async getCurrentUser(): Promise<AuthUser | null> {
    return requestJson<AuthUser | null>('/api/auth/me');
  },

  async login({ email, password }: LoginPayload): Promise<AuthUser> {
    return requestJson<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register({ name, email, password }: RegisterPayload): Promise<AuthUser> {
    return requestJson<AuthUser>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async logout(): Promise<void> {
    await requestJson<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    return requestJson<AuthUser>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await requestJson<void>('/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
