import { BadRequestException } from '@nestjs/common';
import { Weekday } from '@prisma/client';

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const WEEKDAY_ORDER: WeekdayKey[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

const WEEKDAY_MAP: Record<WeekdayKey, Weekday> = {
  mon: Weekday.MON,
  tue: Weekday.TUE,
  wed: Weekday.WED,
  thu: Weekday.THU,
  fri: Weekday.FRI,
  sat: Weekday.SAT,
  sun: Weekday.SUN,
};

const REVERSE_WEEKDAY_MAP: Record<Weekday, WeekdayKey> = {
  [Weekday.MON]: 'mon',
  [Weekday.TUE]: 'tue',
  [Weekday.WED]: 'wed',
  [Weekday.THU]: 'thu',
  [Weekday.FRI]: 'fri',
  [Weekday.SAT]: 'sat',
  [Weekday.SUN]: 'sun',
};

export function toWeekday(value: string): Weekday {
  const normalized = value.toLowerCase() as WeekdayKey;

  if (!(normalized in WEEKDAY_MAP)) {
    throw new BadRequestException(
      'Weekday must be one of: mon, tue, wed, thu, fri, sat, sun.',
    );
  }

  return WEEKDAY_MAP[normalized];
}

export function fromWeekday(value: Weekday): WeekdayKey {
  return REVERSE_WEEKDAY_MAP[value];
}
