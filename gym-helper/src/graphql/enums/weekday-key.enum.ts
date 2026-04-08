import { registerEnumType } from '@nestjs/graphql';

export enum WeekdayKey {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}

registerEnumType(WeekdayKey, {
  name: 'WeekdayKey',
  description: 'Weekday key used by GymHelper workout plans.',
  valuesMap: {
    MON: { description: 'Monday' },
    TUE: { description: 'Tuesday' },
    WED: { description: 'Wednesday' },
    THU: { description: 'Thursday' },
    FRI: { description: 'Friday' },
    SAT: { description: 'Saturday' },
    SUN: { description: 'Sunday' },
  },
});
