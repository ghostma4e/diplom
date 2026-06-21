import { useCallback, useEffect, useState } from 'react';

import { useLocale } from '../context/LocaleContext.jsx';

import { useConfirm } from '../context/ConfirmContext.jsx';

import { api } from '../api/client.js';

import AdminEventForm from '../components/AdminEventForm.jsx';

import AdminEventReview from '../components/AdminEventReview.jsx';



function getEventStatus(start, end) {

  const now = Date.now();

  const startMs = new Date(start).getTime();

  const endMs = new Date(end).getTime();

  if (now < startMs) return 'soon';

  if (now >= startMs && now <= endMs) return 'live';

  return 'done';

}



const FORMAT_KEYS = {

  team: 'events.format.team',

  solo: 'events.format.solo',

  mixed: 'events.format.mixed',

};



export default function EventsPage({ isGuest, isAdmin, onParticipate, onRequestLogin }) {

  const { t, locale } = useLocale();

  const { confirm } = useConfirm();

  const [events, setEvents] = useState([]);

  const [error, setError] = useState('');

  const [participating, setParticipating] = useState(null);

  const [joinedIds, setJoinedIds] = useState(new Set());



  const loadEvents = useCallback(async () => {

    try {

      const data = await api.getEvents();

      setEvents(data.events || []);

      setError('');

    } catch (err) {

      setError(err.message);

    }

  }, []);



  const loadParticipations = useCallback(async () => {

    if (isGuest) {

      setJoinedIds(new Set());

      return;

    }

    try {

      const data = await api.getMyParticipations();

      const ids = new Set((data.participations || []).map((p) => p.event_id));

      setJoinedIds(ids);

    } catch {

      setJoinedIds(new Set());

    }

  }, [isGuest]);



  useEffect(() => {

    loadEvents();

    loadParticipations();

  }, [loadEvents, loadParticipations]);



  function formatDateTimeRange(start, end) {

    const loc = locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU';

    const opts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };

    const s = new Date(start).toLocaleString(loc, opts);

    const e = new Date(end).toLocaleString(loc, opts);

    return `${s} — ${e}`;

  }



  async function handleParticipate(eventId) {

    if (isGuest) {

      onRequestLogin();

      return;

    }

    setParticipating(eventId);

    setError('');

    try {

      await api.participateEvent(eventId);

      setJoinedIds((prev) => new Set([...prev, eventId]));

      onParticipate();

    } catch (err) {

      if (err.message?.includes('Already')) {

        setJoinedIds((prev) => new Set([...prev, eventId]));

      } else {

        setError(err.message);

      }

    } finally {

      setParticipating(null);

    }

  }



  async function handleDelete(id) {

    const ok = await confirm({

      title: t('events.admin.delete'),

      message: t('events.admin.deleteConfirm'),

      confirmLabel: t('events.admin.delete'),

      variant: 'danger',

    });

    if (!ok) return;

    try {

      await api.deleteEvent(id);

      await loadEvents();

    } catch (err) {

      setError(err.message);

    }

  }



  return (

    <div className="page events-page">

      <header className="page-header">

        <h1>{t('events.title')}</h1>

        <p>{t('events.subtitle')}</p>

        {error && <p className="error inline">{error}</p>}

      </header>



      {isAdmin && <AdminEventForm onCreated={loadEvents} />}

      {isAdmin && <AdminEventReview events={events} />}



      <div className="events-grid">

        {events.map((ev) => {

          const status = getEventStatus(ev.starts_at, ev.ends_at);

          const isLive = status === 'live';

          const joined = joinedIds.has(ev.id);



          return (

            <article

              key={ev.id}

              className={`event-tile ${status} ${isLive ? 'is-live' : ''}`}

            >

              <div className="event-tile-top">

                <span className={`event-status-pill ${status}`}>{t(`status.${status}`)}</span>

                <span className="event-format-tag">

                  {t(FORMAT_KEYS[ev.format_type] || FORMAT_KEYS.team)}

                </span>

              </div>

              <h3 className="event-topic">{ev.topic}</h3>

              <p className="event-desc">{ev.description}</p>

              <p className="event-date-range">{formatDateTimeRange(ev.starts_at, ev.ends_at)}</p>



              {joined && <span className="event-joined-badge">{t('events.joined')}</span>}



              {isLive && !joined && (

                <button

                  type="button"

                  className="btn-primary event-join-btn"

                  disabled={participating === ev.id}

                  onClick={() => handleParticipate(ev.id)}

                >

                  {participating === ev.id ? t('events.joining') : t('events.participate')}

                </button>

              )}



              {status === 'soon' && (

                <span className="event-soon-label">{t('events.startsSoon')}</span>

              )}



              {status === 'done' && (

                <span className="event-done-label">{t('events.finished')}</span>

              )}



              {isAdmin && (

                <button

                  type="button"

                  className="btn-danger-text"

                  onClick={() => handleDelete(ev.id)}

                >

                  {t('events.admin.delete')}

                </button>

              )}

            </article>

          );

        })}

        {!events.length && <p className="muted full-width">{t('events.empty')}</p>}

      </div>

    </div>

  );

}

