import type { AuthUser, UserRole } from '../store/types';

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UpdateProfilePayload = {
  name: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type AdminUser = AuthUser & {
  createdAt: string;
};

export type UpdateUserRolePayload = {
  role: UserRole;
};
