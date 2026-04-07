import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { restApi } from '../api/restApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusPanel from '../components/ui/StatusPanel';
import type { RestDay } from '../store/types';
import { getTodayISO, isValidISODate } from '../utils/date';

const createEmptyRestDay = (date: string): RestDay => ({
  date,
  isRest: false,
});

export default function RestPage() {
  const navigate = useNavigate();
  const params = useParams();
  const today = getTodayISO();
  const date = params.date && isValidISODate(params.date) ? params.date : today;

  const [requestId, setRequestId] = useState(0);
  const [draft, setDraft] = useState<RestDay>(createEmptyRestDay(date));
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.date && !isValidISODate(params.date)) {
      navigate(`/rest/${today}`, { replace: true });
    }
  }, [navigate, params.date, today]);

  useEffect(() => {
    let isMounted = true;

    const loadRest = async () => {
      setStatus('loading');
      setError('');

      try {
        const restDay = await restApi.getDay(date);

        if (!isMounted) {
          return;
        }

        if (!restDay) {
          setDraft(createEmptyRestDay(date));
          setStatus('empty');
          return;
        }

        setDraft(restDay);
        setStatus('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить отдых.');
        setStatus('error');
      }
    };

    void loadRest();

    return () => {
      isMounted = false;
    };
  }, [date, requestId]);

  const createDraft = () => {
    setDraft(createEmptyRestDay(date));
    setStatus('ready');
  };

  const saveRest = async () => {
    setIsSaving(true);

    try {
      const savedRest = await restApi.saveDay(date, draft);

      if (!savedRest) {
        setDraft(createEmptyRestDay(date));
        setStatus('empty');
        return;
      }

      setDraft(savedRest);
      setStatus('ready');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить отдых.');
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Отдых</h1>
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
                  navigate(`/rest/${value}`);
                }
              }}
            />
            {status === 'ready' && (
              <Button variant="primary" onClick={() => void saveRest()} disabled={isSaving}>
                {isSaving ? 'Сохраняем...' : 'Сохранить'}
              </Button>
            )}
          </div>
        </div>

        {status === 'loading' && (
          <StatusPanel title="Загружаем отдых" description="Подтягиваем запись на выбранную дату." variant="loading" />
        )}

        {status === 'error' && (
          <StatusPanel
            title="Не удалось загрузить отдых"
            description={error}
            actionLabel="Повторить"
            onAction={() => setRequestId((currentValue) => currentValue + 1)}
            variant="error"
          />
        )}

        {status === 'empty' && (
          <StatusPanel
            title="На эту дату записи нет"
            description="Создай запись про сон или отдых, затем сохрани."
            actionLabel="Создать запись"
            onAction={createDraft}
            variant="empty"
          />
        )}

        {status === 'ready' && (
          <div className="stack">
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={draft.isRest}
                onChange={(event) =>
                  setDraft((currentDraft) => ({ ...currentDraft, isRest: event.target.checked }))
                }
              />
              <span>Это день отдыха</span>
            </label>

            <Input
              label="Сон, часы"
              type="text"
              inputMode="decimal"
              value={draft.sleepHours ?? ''}
              onChange={(event) => {
                const value = event.target.value.trim();
                if (!value) {
                  setDraft((currentDraft) => ({ ...currentDraft, sleepHours: undefined }));
                  return;
                }

                const numberValue = Number(value.replace(',', '.'));
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  sleepHours: Number.isNaN(numberValue) ? undefined : Math.max(0, numberValue),
                }));
              }}
            />

            <Input
              label="Заметка"
              value={draft.note ?? ''}
              onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, note: event.target.value }))}
            />
          </div>
        )}
      </section>
    </div>
  );
}
