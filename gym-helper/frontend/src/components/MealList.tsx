import Button from './ui/Button';
import Input from './ui/Input';
import type { MealEntry } from '../store/types';

type MealListProps = {
  meals: MealEntry[];
  onAdd: () => void;
  onChange: (id: string, changes: Partial<MealEntry>) => void;
  onRemove: (id: string) => void;
};

export default function MealList({ meals, onAdd, onChange, onRemove }: MealListProps) {
  return (
    <div className="stack">
      {meals.length === 0 ? (
        <div className="empty-card">
          <Button variant="primary" onClick={onAdd}>
            Добавить запись
          </Button>
        </div>
      ) : (
        <div className="list">
          {meals.map((meal, index) => (
            <div key={meal.id} className="list-row">
              <div className="list-row-header">
                <div className="list-row-title">Прием пищи {index + 1}</div>
                <Button variant="ghost" onClick={() => onRemove(meal.id)}>
                  Удалить
                </Button>
              </div>
              <Input
                label="Название"
                value={meal.title}
                onChange={(event) => onChange(meal.id, { title: event.target.value })}
              />
              <div className="form-grid">
                <Input
                  label="Калории"
                  type="text"
                  inputMode="numeric"
                  value={meal.calories ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      onChange(meal.id, { calories: undefined });
                      return;
                    }
                    const numberValue = Number(value);
                    onChange(meal.id, {
                      calories: Number.isNaN(numberValue) ? undefined : Math.max(0, numberValue),
                    });
                  }}
                />
                <Input
                  label="Белки"
                  type="text"
                  inputMode="numeric"
                  value={meal.protein ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      onChange(meal.id, { protein: undefined });
                      return;
                    }
                    const numberValue = Number(value);
                    onChange(meal.id, {
                      protein: Number.isNaN(numberValue) ? undefined : Math.max(0, numberValue),
                    });
                  }}
                />
                <Input
                  label="Жиры"
                  type="text"
                  inputMode="numeric"
                  value={meal.fat ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      onChange(meal.id, { fat: undefined });
                      return;
                    }
                    const numberValue = Number(value);
                    onChange(meal.id, {
                      fat: Number.isNaN(numberValue) ? undefined : Math.max(0, numberValue),
                    });
                  }}
                />
                <Input
                  label="Углеводы"
                  type="text"
                  inputMode="numeric"
                  value={meal.carbs ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      onChange(meal.id, { carbs: undefined });
                      return;
                    }
                    const numberValue = Number(value);
                    onChange(meal.id, {
                      carbs: Number.isNaN(numberValue) ? undefined : Math.max(0, numberValue),
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {meals.length > 0 && (
        <Button variant="primary" onClick={onAdd}>
          Добавить запись
        </Button>
      )}
    </div>
  );
}