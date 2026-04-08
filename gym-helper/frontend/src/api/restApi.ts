import type { RestDay } from '../store/types';
import { requestJson } from './http';

export const restApi = {
  async list(): Promise<Record<string, RestDay>> {
    return requestJson<Record<string, RestDay>>('/api/rest');
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
