import { useEffect, useState } from 'react';
import { planApi } from '../api/planApi';
import DayPicker from '../components/DayPicker';
import PlanExerciseList from '../components/PlanExerciseList';
import Button from '../components/ui/Button';
import StatusPanel from '../components/ui/StatusPanel';
import type { PlanExercise, WeekdayKey } from '../store/types';
import { getWeekdayKey, WEEK_DAYS } from '../utils/date';
import { createId } from '../utils/id';

export default function PlanPage() {
  const [selectedDay, setSelectedDay] = useState<WeekdayKey>(() => getWeekdayKey(new Date()));
  const [requestId, setRequestId] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState<PlanExercise[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dayInfo = WEEK_DAYS.find((day) => day.key === selectedDay);

  useEffect(() => {
    let isMounted = true;

    const loadPlan = async () => {
      setStatus('loading');
      setError('');

      try {
        const [exercises, nextSuggestions] = await Promise.all([
          planApi.getDay(selectedDay),
          planApi.getSuggestions(),
        ]);

        if (!isMounted) {
          return;
        }

        setDraft(exercises);
        setSuggestions(nextSuggestions);
        setStatus('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить план.');
        setStatus('error');
      }
    };

    void loadPlan();

    return () => {
      isMounted = false;
    };
  }, [requestId, selectedDay]);

  const addExercise = () => {
    setDraft((currentDraft) => [
      ...currentDraft,
      {
        id: createId('plan'),
        name: '',
        note: '',
      },
    ]);
  };

  const updateExercise = (id: string, changes: Partial<PlanExercise>) => {
    setDraft((currentDraft) =>
      currentDraft.map((exercise) => (exercise.id === id ? { ...exercise, ...changes } : exercise))
    );
  };

  const removeExercise = (id: string) => {
    setDraft((currentDraft) => currentDraft.filter((exercise) => exercise.id !== id));
  };

  const savePlan = async () => {
    setIsSaving(true);

    try {
      const nextExercises = await planApi.saveDay(selectedDay, draft);
      setDraft(nextExercises);
      setStatus('ready');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить план.');
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>План</h1>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2>{dayInfo?.label ?? 'День'}</h2>
          </div>
          {status === 'ready' && (
            <Button variant="primary" onClick={() => void savePlan()} disabled={isSaving}>
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          )}
        </div>

        <DayPicker value={selectedDay} onChange={setSelectedDay} />

        {status === 'loading' && (
          <StatusPanel title="Загружаем план" description="Подтягиваем упражнения на выбранный день." variant="loading" />
        )}

        {status === 'error' && (
          <StatusPanel
            title="Не удалось загрузить план"
            description={error}
            actionLabel="Повторить"
            onAction={() => setRequestId((currentValue) => currentValue + 1)}
            variant="error"
          />
        )}

        {status === 'ready' && draft.length === 0 && (
          <StatusPanel
            title="План на день пока пуст"
            description="Добавь хотя бы одно упражнение и потом сохрани изменения."
            actionLabel="Добавить упражнение"
            onAction={addExercise}
            variant="empty"
          />
        )}

        {status === 'ready' && draft.length > 0 && (
          <PlanExerciseList
            exercises={draft}
            suggestions={suggestions}
            onAdd={addExercise}
            onChange={updateExercise}
            onRemove={removeExercise}
          />
        )}
      </section>
    </div>
  );
}
