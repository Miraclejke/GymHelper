import Button from './ui/Button';
import Input from './ui/Input';
import type { PlanExercise } from '../store/types';

type PlanExerciseListProps = {
  exercises: PlanExercise[];
  suggestions: string[];
  onAdd: () => void;
  onChange: (id: string, changes: Partial<PlanExercise>) => void;
  onRemove: (id: string) => void;
};

export default function PlanExerciseList({
  exercises,
  suggestions,
  onAdd,
  onChange,
  onRemove,
}: PlanExerciseListProps) {
  const datalistId = 'plan-suggestions';

  return (
    <div className="stack">
      <datalist id={datalistId}>
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      {exercises.length === 0 ? (
        <div className="empty-card">
          <Button variant="primary" onClick={onAdd}>
            Добавить упражнение
          </Button>
        </div>
      ) : (
        <div className="list">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="list-row">
              <div className="list-row-header">
                <div className="list-row-title">Упражнение {index + 1}</div>
                <Button variant="ghost" onClick={() => onRemove(exercise.id)}>
                  Удалить
                </Button>
              </div>
              <div className="form-grid">
                <Input
                  label="Название"
                  list={datalistId}
                  value={exercise.name}
                  onChange={(event) => onChange(exercise.id, { name: event.target.value })}
                />
                <Input
                  label="Комментарий"
                  value={exercise.note}
                  onChange={(event) => onChange(exercise.id, { note: event.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {exercises.length > 0 && (
        <Button variant="primary" onClick={onAdd}>
          Добавить упражнение
        </Button>
      )}
    </div>
  );
}