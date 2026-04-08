import { BadRequestException } from '@nestjs/common';

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function ensureIsoDate(value: string, fieldName = 'date') {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new BadRequestException(
      `Field "${fieldName}" must be in YYYY-MM-DD format.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  const isRealCalendarDate =
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;

  if (!isRealCalendarDate) {
    throw new BadRequestException(
      `Field "${fieldName}" must contain a real calendar date.`,
    );
  }
}

export function toDateOnly(value: string) {
  ensureIsoDate(value);
  return new Date(`${value}T00:00:00.000Z`);
}

export function fromDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}
