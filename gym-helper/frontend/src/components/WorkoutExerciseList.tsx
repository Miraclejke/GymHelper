import Button from './ui/Button';
import Input from './ui/Input';
import SetEditor from './SetEditor';
import type { WorkoutExercise, WorkoutSet } from '../store/types';

type WorkoutExerciseListProps = {
  exercises: WorkoutExercise[];
  suggestions: string[];
  onAddExercise: () => void;
  onUpdateExercise: (id: string, changes: Partial<WorkoutExercise>) => void;
  onRemoveExercise: (id: string) => void;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, changes: Partial<WorkoutSet>) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
};

export default function WorkoutExerciseList({
  exercises,
  suggestions,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: WorkoutExerciseListProps) {
  const datalistId = 'workout-suggestions';

  return (
    <div className="stack">
      <datalist id={datalistId}>
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      {exercises.length === 0 ? (
        <div className="empty-card">
          <Button variant="primary" onClick={onAddExercise}>
            Добавить упражнение
          </Button>
        </div>
      ) : (
        <div className="list">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="list-row">
              <div className="list-row-header">
                <div className="list-row-title">Упражнение {index + 1}</div>
                <Button variant="ghost" onClick={() => onRemoveExercise(exercise.id)}>
                  Удалить
                </Button>
              </div>
              <Input
                label="Название"
                list={datalistId}
                value={exercise.name}
                onChange={(event) => onUpdateExercise(exercise.id, { name: event.target.value })}
              />
              <div className="set-list">
                {exercise.sets.map((setItem, setIndex) => (
                  <SetEditor
                    key={setItem.id}
                    setItem={setItem}
                    index={setIndex}
                    onChange={(changes) => onUpdateSet(exercise.id, setItem.id, changes)}
                    onRemove={() => onRemoveSet(exercise.id, setItem.id)}
                  />
                ))}
                <Button variant="subtle" onClick={() => onAddSet(exercise.id)}>
                  Добавить сет
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {exercises.length > 0 && (
        <Button variant="primary" onClick={onAddExercise}>
          Добавить упражнение
        </Button>
      )}
    </div>
  );
}