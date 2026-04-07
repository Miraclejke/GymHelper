import type { WeekdayKey } from '../store/types';
import { WEEK_DAYS } from '../utils/date';

type DayPickerProps = {
  value: WeekdayKey;
  onChange: (day: WeekdayKey) => void;
};

export default function DayPicker({ value, onChange }: DayPickerProps) {
  return (
    <div className="day-picker">
      {WEEK_DAYS.map((day) => (
        <button
          key={day.key}
          type="button"
          className={`day-chip ${value === day.key ? 'active' : ''}`.trim()}
          onClick={() => onChange(day.key)}
        >
          <span className="day-chip-short">{day.short}</span>
          <span className="day-chip-label">{day.label}</span>
        </button>
      ))}
    </div>
  );
}
