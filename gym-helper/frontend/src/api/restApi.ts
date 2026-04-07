import type { RestDay } from '../store/types';
import { getCurrentUserData, updateCurrentUserData } from './mockDb';

const normalizeRestDay = (date: string, restDay: RestDay): RestDay | null => {
  const normalized: RestDay = {
    ...restDay,
    date,
    note: restDay.note?.trim(),
  };

  if (normalized.sleepHours === undefined && !normalized.note && normalized.isRest === false) {
    return null;
  }

  return normalized;
};

export const restApi = {
  async list(): Promise<Record<string, RestDay>> {
    return getCurrentUserData().rest;
  },

  async getDay(date: string): Promise<RestDay | null> {
    return getCurrentUserData().rest[date] ?? null;
  },

  async saveDay(date: string, restDay: RestDay): Promise<RestDay | null> {
    const normalized = normalizeRestDay(date, restDay);

    const nextData = updateCurrentUserData((currentData) => {
      const nextRest = { ...currentData.rest };

      if (!normalized) {
        delete nextRest[date];
      } else {
        nextRest[date] = normalized;
      }

      return {
        ...currentData,
        rest: nextRest,
      };
    });

    return nextData.rest[date] ?? null;
  },
};
