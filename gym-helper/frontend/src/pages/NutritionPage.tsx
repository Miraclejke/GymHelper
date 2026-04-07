import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nutritionApi } from '../api/nutritionApi';
import MealList from '../components/MealList';
import Button from '../components/ui/Button';
import StatusPanel from '../components/ui/StatusPanel';
import type { MealEntry } from '../store/types';
import { getTodayISO, isValidISODate } from '../utils/date';
import { createId } from '../utils/id';

export default function NutritionPage() {
  const navigate = useNavigate();
  const params = useParams();
  const today = getTodayISO();
  const date = params.date && isValidISODate(params.date) ? params.date : today;

  const [requestId, setRequestId] = useState(0);
  const [draft, setDraft] = useState<MealEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.date && !isValidISODate(params.date)) {
      navigate(`/nutrition/${today}`, { replace: true });
    }
  }, [navigate, params.date, today]);

  useEffect(() => {
    let isMounted = true;

    const loadNutrition = async () => {
      setStatus('loading');
      setError('');

      try {
        const nutritionDay = await nutritionApi.getDay(date);

        if (!isMounted) {
          return;
        }

        if (!nutritionDay) {
          setDraft([]);
          setStatus('empty');
          return;
        }

        setDraft(nutritionDay.meals);
        setStatus('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить питание.');
        setStatus('error');
      }
    };

    void loadNutrition();

    return () => {
      isMounted = false;
    };
  }, [date, requestId]);

  const createDraft = () => {
    setDraft([]);
    setStatus('ready');
  };

  const addMeal = () => {
    setDraft((currentDraft) => [
      ...currentDraft,
      {
        id: createId('meal'),
        title: '',
      },
    ]);
  };

  const updateMeal = (id: string, changes: Partial<MealEntry>) => {
    setDraft((currentDraft) =>
      currentDraft.map((meal) => (meal.id === id ? { ...meal, ...changes } : meal))
    );
  };

  const removeMeal = (id: string) => {
    setDraft((currentDraft) => currentDraft.filter((meal) => meal.id !== id));
  };

  const saveNutrition = async () => {
    setIsSaving(true);

    try {
      const savedNutrition = await nutritionApi.saveDay(date, draft);

      if (!savedNutrition) {
        setDraft([]);
        setStatus('empty');
        return;
      }

      setDraft(savedNutrition.meals);
      setStatus('ready');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить питание.');
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const totals = useMemo(
    () =>
      draft.reduce(
        (result, meal) => ({
          calories: result.calories + (meal.calories ?? 0),
          protein: result.protein + (meal.protein ?? 0),
          fat: result.fat + (meal.fat ?? 0),
          carbs: result.carbs + (meal.carbs ?? 0),
        }),
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      ),
    [draft]
  );

  const hasTotals = draft.some(
    (meal) =>
      meal.calories !== undefined ||
      meal.protein !== undefined ||
      meal.fat !== undefined ||
      meal.carbs !== undefined
  );

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Питание</h1>
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
                  navigate(`/nutrition/${value}`);
                }
              }}
            />
            {status === 'ready' && (
              <Button variant="primary" onClick={() => void saveNutrition()} disabled={isSaving}>
                {isSaving ? 'Сохраняем...' : 'Сохранить'}
              </Button>
            )}
          </div>
        </div>

        {status === 'loading' && (
          <StatusPanel
            title="Загружаем питание"
            description="Подтягиваем записи на выбранную дату."
            variant="loading"
          />
        )}

        {status === 'error' && (
          <StatusPanel
            title="Не удалось загрузить питание"
            description={error}
            actionLabel="Повторить"
            onAction={() => setRequestId((currentValue) => currentValue + 1)}
            variant="error"
          />
        )}

        {status === 'empty' && (
          <StatusPanel
            title="На эту дату записей нет"
            description="Создай приемы пищи и затем сохрани их."
            actionLabel="Создать запись"
            onAction={createDraft}
            variant="empty"
          />
        )}

        {status === 'ready' && (
          <>
            <MealList meals={draft} onAdd={addMeal} onChange={updateMeal} onRemove={removeMeal} />
            {hasTotals && (
              <div className="totals">
                <h3>Итого</h3>
                <div className="totals-grid">
                  <div>Калории: {totals.calories} ккал</div>
                  <div>Белки: {totals.protein} г</div>
                  <div>Жиры: {totals.fat} г</div>
                  <div>Углеводы: {totals.carbs} г</div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
