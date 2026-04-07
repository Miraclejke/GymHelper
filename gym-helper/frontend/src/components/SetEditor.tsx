import Button from './ui/Button';
import Input from './ui/Input';
import type { WorkoutSet } from '../store/types';

type SetEditorProps = {
  setItem: WorkoutSet;
  index: number;
  onChange: (changes: Partial<WorkoutSet>) => void;
  onRemove: () => void;
};

export default function SetEditor({ setItem, index, onChange, onRemove }: SetEditorProps) {
  const weightValue = setItem.weight ?? '';
  const repsValue = setItem.reps ?? '';

  return (
    <div className="set-row">
      <div className="set-label">Сет {index + 1}</div>
      <div className="set-fields">
        <Input
          label="Вес, кг"
          type="text"
          inputMode="decimal"
          value={weightValue}
          onChange={(event) => {
            const value = event.target.value;
            if (value === '') {
              onChange({ weight: undefined });
              return;
            }
            const numberValue = Number(value.replace(',', '.'));
            onChange({ weight: Number.isNaN(numberValue) ? undefined : Math.max(0, numberValue) });
          }}
        />
        <Input
          label="Повторы"
          type="text"
          inputMode="numeric"
          value={repsValue}
          onChange={(event) => {
            const value = event.target.value;
            if (value === '') {
              onChange({ reps: undefined });
              return;
            }
            const numberValue = Number(value);
            onChange({ reps: Number.isNaN(numberValue) ? undefined : Math.max(1, numberValue) });
          }}
        />
      </div>
      <Button variant="ghost" onClick={onRemove}>
        Удалить
      </Button>
    </div>
  );
}
