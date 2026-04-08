import type { RestDay } from '../store/types';
import { requestJson } from './http';
import type { PaginatedResponse } from './types';

export const restApi = {
  async list(page = 1, limit = 10): Promise<PaginatedResponse<RestDay>> {
    return requestJson<PaginatedResponse<RestDay>>(
      `/api/rest?page=${page}&limit=${limit}`,
    );
  },

  async getDay(date: string): Promise<RestDay | null> {
    return requestJson<RestDay | null>(`/api/rest/${date}`);
  },

  async saveDay(date: string, restDay: RestDay): Promise<RestDay | null> {
    return requestJson<RestDay | null>(`/api/rest/${date}`, {
      method: 'PUT',
      body: JSON.stringify(restDay),
    });
  },
};
