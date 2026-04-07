import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutApi } from '../api/workoutApi';
import WorkoutExerciseList from '../components/WorkoutExerciseList';
import Button from '../components/ui/Button';
import StatusPanel from '../components/ui/StatusPanel';
import type { WorkoutExercise, WorkoutSet } from '../store/types';
import { getTodayISO, isValidISODate } from '../utils/date';
import { createId } from '../utils/id';

export default function WorkoutPage() {
  const navigate = useNavigate();
  const params = useParams();
  const today = getTodayISO();
  const date = params.date && isValidISODate(params.date) ? params.date : today;

  const [requestId, setRequestId] = useState(0);
  const [draft, setDraft] = useState<WorkoutExercise[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.date && !isValidISODate(params.date)) {
      navigate(`/workout/${today}`, { replace: true });
    }
  }, [navigate, params.date, today]);

  useEffect(() => {
    let isMounted = true;

    const loadWorkout = async () => {
      setStatus('loading');
      setError('');

      try {
        const [workoutDay, nextSuggestions] = await Promise.all([
          workoutApi.getDay(date),
          workoutApi.getSuggestions(),
        ]);

        if (!isMounted) {
          return;
        }

        setSuggestions(nextSuggestions);

        if (!workoutDay) {
          setDraft([]);
          setStatus('empty');
          return;
        }

        setDraft(workoutDay.exercises);
        setStatus('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить тренировку.');
        setStatus('error');
      }
    };

    void loadWorkout();

    return () => {
      isMounted = false;
    };
  }, [date, requestId]);

  const createDraft = () => {
    setDraft([]);
    setStatus('ready');
  };

  const addExercise = () => {
    setDraft((currentDraft) => [
      ...currentDraft,
      {
        id: createId('workout'),
        name: '',
        sets: [],
      },
    ]);
  };

  const updateExercise = (id: string, changes: Partial<WorkoutExercise>) => {
    setDraft((currentDraft) =>
      currentDraft.map((exercise) => (exercise.id === id ? { ...exercise, ...changes } : exercise))
    );
  };

  const removeExercise = (id: string) => {
    setDraft((currentDraft) => currentDraft.filter((exercise) => exercise.id !== id));
  };

  const addSet = (exerciseId: string) => {
    setDraft((currentDraft) =>
      currentDraft.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: [...exercise.sets, { id: createId('set') }],
            }
          : exercise
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, changes: Partial<WorkoutSet>) => {
    setDraft((currentDraft) =>
      currentDraft.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((setItem) =>
                setItem.id === setId ? { ...setItem, ...changes } : setItem
              ),
            }
          : exercise
      )
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setDraft((currentDraft) =>
      currentDraft.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((setItem) => setItem.id !== setId),
            }
          : exercise
      )
    );
  };

  const saveWorkout = async () => {
    setIsSaving(true);

    try {
      const savedWorkout = await workoutApi.saveDay(date, draft);

      if (!savedWorkout) {
        setDraft([]);
        setStatus('empty');
        return;
      }

      setDraft(savedWorkout.exercises);
      setStatus('ready');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить тренировку.');
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Тренировка</h1>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Дата</h2>
          </div>
          <div className="page-actions">
            <input
              className="input"
              type="date"
              value={date}
              onChange={(event) => {
                const value = event.target.value;
                if (value) {
                  navigate(`/workout/${value}`);
                }
              }}
            />
            {status === 'ready' && (
              <Button variant="primary" onClick={() => void saveWorkout()} disabled={isSaving}>
                {isSaving ? 'Сохраняем...' : 'Сохранить'}
              </Button>
            )}
          </div>
        </div>

        {status === 'loading' && (
          <StatusPanel
            title="Загружаем тренировку"
            description="Подтягиваем данные на выбранную дату."
            variant="loading"
          />
        )}

        {status === 'error' && (
          <StatusPanel
            title="Не удалось загрузить тренировку"
            description={error}
            actionLabel="Повторить"
            onAction={() => setRequestId((currentValue) => currentValue + 1)}
            variant="error"
          />
        )}

        {status === 'empty' && (
          <StatusPanel
            title="На эту дату тренировки нет"
            description="Создай запись, заполни упражнения и потом сохрани."
            actionLabel="Создать запись"
            onAction={createDraft}
            variant="empty"
          />
        )}

        {status === 'ready' && (
          <WorkoutExerciseList
            exercises={draft}
            suggestions={suggestions}
            onAddExercise={addExercise}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
            onAddSet={addSet}
            onUpdateSet={updateSet}
            onRemoveSet={removeSet}
          />
        )}
      </section>
    </div>
  );
}
