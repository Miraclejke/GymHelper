import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, type DashboardSummary } from '../api/dashboardApi';
import StatusPanel from '../components/ui/StatusPanel';
import Button from '../components/ui/Button';
import { getTodayISO, getWeekdayKey, WEEK_DAYS } from '../utils/date';

const EMPTY_SUMMARY: DashboardSummary = {
  workoutDays: 0,
  avgCalories: 0,
  avgSleep: 0,
};
const SSE_RECONNECT_DELAY_MS = 3000;

export default function DashboardPage() {
  const today = getTodayISO();
  const dayKey = getWeekdayKey(new Date());
  const dayLabel = WEEK_DAYS.find((day) => day.key === dayKey)?.label ?? '';

  const [requestId, setRequestId] = useState(0);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setStatus('loading');
      setError('');

      try {
        const nextSummary = await dashboardApi.getSummary();

        if (!isMounted) {
          return;
        }

        setSummary(nextSummary);
        setStatus('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить дашборд.'
        );
        setStatus('error');
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  useEffect(() => {
    let isActive = true;
    let reconnectTimer: number | undefined;
    let currentSource: EventSource | null = null;

    const connect = () => {
      if (!isActive) {
        return;
      }

      const source = new EventSource('/api/dashboard/stream');
      currentSource = source;

      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as { message?: string };
          setLiveMessage(payload.message ?? 'Данные обновлены.');
        } catch {
          setLiveMessage('Данные обновлены.');
        }

        setRequestId((currentValue) => currentValue + 1);
      };

      source.onerror = () => {
        source.close();

        if (!isActive) {
          return;
        }

        reconnectTimer = window.setTimeout(connect, SSE_RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      isActive = false;

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }

      currentSource?.close();
    };
  }, []);

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Дашборд</h1>
          <p className="muted">
            {today} {dayLabel}
          </p>
          {liveMessage && <p className="muted">{liveMessage}</p>}
        </div>
      </section>

      {status === 'loading' && (
        <StatusPanel
          title="Загружаем данные"
          description="Считаем статистику и подтягиваем записи."
          variant="loading"
        />
      )}

      {status === 'error' && (
        <StatusPanel
          title="Не удалось загрузить дашборд"
          description={error}
          variant="error"
        />
      )}

      {status === 'ready' && (
        <section className="grid grid-3">
          <div className="simple-card">
            <div className="simple-title">За 14 дней</div>
            <div className="muted">Тренировок: {summary.workoutDays}</div>
            <div className="muted">
              Калорий в среднем: {summary.avgCalories || '—'}
            </div>
            <div className="muted">
              Сон в среднем: {summary.avgSleep || '—'} ч
            </div>
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
