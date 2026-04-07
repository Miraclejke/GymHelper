import type { WeekdayKey } from '../store/types';

export const WEEK_DAYS: { key: WeekdayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Понедельник', short: 'Пн' },
  { key: 'tue', label: 'Вторник', short: 'Вт' },
  { key: 'wed', label: 'Среда', short: 'Ср' },
  { key: 'thu', label: 'Четверг', short: 'Чт' },
  { key: 'fri', label: 'Пятница', short: 'Пт' },
  { key: 'sat', label: 'Суббота', short: 'Сб' },
  { key: 'sun', label: 'Воскресенье', short: 'Вс' },
];

const DAY_MAP: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekdayKey(date: Date): WeekdayKey {
  return DAY_MAP[date.getDay()];
}

export function isValidISODate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
