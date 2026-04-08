import { BadRequestException } from '@nestjs/common';
import { Weekday } from '@prisma/client';

export type WeekdayKey =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

const WEEKDAY_MAP: Record<WeekdayKey, Weekday> = {
  mon: Weekday.MON,
  tue: Weekday.TUE,
  wed: Weekday.WED,
  thu: Weekday.THU,
  fri: Weekday.FRI,
  sat: Weekday.SAT,
  sun: Weekday.SUN,
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
