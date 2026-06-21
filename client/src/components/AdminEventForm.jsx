import { useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { api } from '../api/client.js';

export default function AdminEventForm({ onCreated }) {
  const { t } = useLocale();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [formatType, setFormatType] = useState('team');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createEvent({
        topic,
        description,
        formatType,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      setTopic('');
      setDescription('');
      setStartsAt('');
      setEndsAt('');
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel admin-event-form">
      <h2>{t('events.admin.title')}</h2>
      <p className="form-hint">{t('events.admin.hint')}</p>
      <form className="admin-form-grid" onSubmit={handleSubmit}>
        <label>
          {t('events.admin.topic')}
          <input value={topic} onChange={(e) => setTopic(e.target.value)} required />
        </label>
        <label>
          {t('events.admin.format')}
          <select value={formatType} onChange={(e) => setFormatType(e.target.value)}>
            <option value="team">{t('events.format.team')}</option>
            <option value="solo">{t('events.format.solo')}</option>
            <option value="mixed">{t('events.format.mixed')}</option>
          </select>
        </label>
        <label className="full">
          {t('events.admin.description')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </label>
        <label>
          {t('events.admin.starts')}
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </label>
        <label>
          {t('events.admin.ends')}
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </label>
        {error && <p className="error full">{error}</p>}
        <button type="submit" className="btn-primary full" disabled={loading}>
          {loading ? t('events.admin.saving') : t('events.admin.create')}
        </button>
      </form>
    </section>
  );
}
