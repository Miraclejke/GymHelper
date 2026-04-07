import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { nutritionApi } from '../api/nutritionApi';
import { restApi } from '../api/restApi';
import { workoutApi } from '../api/workoutApi';
import StatusPanel from '../components/ui/StatusPanel';
import Button from '../components/ui/Button';
import type { NutritionDay, RestDay, WorkoutDay } from '../store/types';
import { getTodayISO, getWeekdayKey, WEEK_DAYS } from '../utils/date';

const DAYS_RANGE = 14;

type DashboardData = {
  workouts: Record<string, WorkoutDay>;
  nutrition: Record<string, NutritionDay>;
  rest: Record<string, RestDay>;
};

function getPastDates(count: number) {
  const dates: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

export default function DashboardPage() {
  const today = getTodayISO();
  const dayKey = getWeekdayKey(new Date());
  const dayLabel = WEEK_DAYS.find((day) => day.key === dayKey)?.label ?? '';

  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardData>({
    workouts: {},
    nutrition: {},
    rest: {},
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setStatus('loading');
      setError('');

      try {
        const [workouts, nutrition, rest] = await Promise.all([
          workoutApi.list(),
          nutritionApi.list(),
          restApi.list(),
        ]);

        if (!isMounted) {
          return;
        }

        setData({ workouts, nutrition, rest });
        setStatus('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить дашборд.');
        setStatus('error');
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const dates = getPastDates(DAYS_RANGE);
    let workoutDays = 0;
    let caloriesSum = 0;
    let caloriesDays = 0;
    let sleepSum = 0;
    let sleepDays = 0;

    dates.forEach((date) => {
      if (data.workouts[date]?.exercises.length) {
        workoutDays += 1;
      }

      const meals = data.nutrition[date]?.meals ?? [];
      const dayCalories = meals.reduce(
        (total, meal) => (meal.calories !== undefined ? total + meal.calories : total),
        0
      );

      if (meals.some((meal) => meal.calories !== undefined)) {
        caloriesSum += dayCalories;
        caloriesDays += 1;
      }

      const sleepHours = data.rest[date]?.sleepHours;
      if (sleepHours !== undefined) {
        sleepSum += sleepHours;
        sleepDays += 1;
      }
    });

    return {
      workoutDays,
      avgCalories: caloriesDays ? Math.round(caloriesSum / caloriesDays) : 0,
      avgSleep: sleepDays ? Math.round((sleepSum / sleepDays) * 10) / 10 : 0,
    };
  }, [data]);

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Дашборд</h1>
          <p className="muted">
            {today} {dayLabel}
          </p>
        </div>
      </section>

      {status === 'loading' && (
        <StatusPanel title="Загружаем данные" description="Считаем статистику и подтягиваем записи." variant="loading" />
      )}

      {status === 'error' && (
        <StatusPanel title="Не удалось загрузить дашборд" description={error} variant="error" />
      )}

      {status === 'ready' && (
        <section className="grid grid-3">
          <div className="simple-card">
            <div className="simple-title">За 14 дней</div>
            <div className="muted">Тренировок: {stats.workoutDays}</div>
            <div className="muted">Калорий в среднем: {stats.avgCalories || '—'}</div>
            <div className="muted">Сон в среднем: {stats.avgSleep || '—'} ч</div>
          </div>
          <div className="simple-card">
            <div className="simple-title">Тренировка</div>
            <div className="muted">Сегодня</div>
            <Link to={`/workout/${today}`}>
              <Button variant="subtle">Открыть</Button>
            </Link>
          </div>
          <div className="simple-card">
            <div className="simple-title">Питание</div>
            <div className="muted">Сегодня</div>
            <Link to={`/nutrition/${today}`}>
              <Button variant="subtle">Открыть</Button>
            </Link>
          </div>
          <div className="simple-card">
            <div className="simple-title">Отдых</div>
            <div className="muted">Сегодня</div>
            <Link to={`/rest/${today}`}>
              <Button variant="subtle">Открыть</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
