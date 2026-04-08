import { requestJson } from './http';
import type { AdminUser, UpdateUserRolePayload } from './types';

export const adminApi = {
  async listUsers(): Promise<AdminUser[]> {
    return requestJson<AdminUser[]>('/api/admin/users');
  },

  async updateUserRole(
    userId: string,
    payload: UpdateUserRolePayload,
  ): Promise<AdminUser> {
    return requestJson<AdminUser>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
