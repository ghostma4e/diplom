import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { api } from '../api/client.js';
import CriteriaSlider from './CriteriaSlider.jsx';

function SubmissionRow({ submission, eventId, onRated }) {
  const { t } = useLocale();
  const r = submission.rating;
  const [design, setDesign] = useState(r?.score_design ?? 50);
  const [technical, setTechnical] = useState(r?.score_technical ?? 50);
  const [tasks, setTasks] = useState(r?.score_tasks ?? 50);
  const [note, setNote] = useState(r?.review_note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const total = Math.round((Number(design) + Number(technical) + Number(tasks)) / 3);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.rateProject(submission.id, {
        scoreDesign: design,
        scoreTechnical: technical,
        scoreTasks: tasks,
        reviewNote: note,
      });
      await onRated(eventId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="review-row" onSubmit={handleSave}>
      <div className="review-row-info">
        <strong>{submission.project_name}</strong>
        <span className="muted">{submission.teams?.team_name}</span>
        {submission.github_url && (
          <a
            href={submission.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="review-github"
          >
            GitHub
          </a>
        )}
      </div>

      <div className="criteria-sliders-grid">
        <CriteriaSlider
          label={t('review.design')}
          value={design}
          onChange={setDesign}
          disabled={saving}
        />
        <CriteriaSlider
          label={t('review.technical')}
          value={technical}
          onChange={setTechnical}
          disabled={saving}
        />
        <CriteriaSlider
          label={t('review.tasks')}
          value={tasks}
          onChange={setTasks}
          disabled={saving}
        />
      </div>

      <p className="review-total">
        {t('review.total')}: <strong>{total}</strong>/100
      </p>

      <label className="review-note-label full">
        {t('review.note')}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="—" />
      </label>

      <button type="submit" className="btn-primary small-btn" disabled={saving}>
        {saving ? t('review.saving') : t('review.save')}
      </button>
      {error && <p className="error small">{error}</p>}
    </form>
  );
}

export default function AdminEventReview({ events }) {
  const { t } = useLocale();
  const [expandedId, setExpandedId] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(null);

  const loadSubmissions = useCallback(async (eventId) => {
    setLoading(eventId);
    try {
      const data = await api.getEventSubmissions(eventId);
      setSubmissions((prev) => ({ ...prev, [eventId]: data.submissions || [] }));
    } catch {
      setSubmissions((prev) => ({ ...prev, [eventId]: [] }));
    } finally {
      setLoading(null);
    }
  }, []);

  useEffect(() => {
    if (expandedId) loadSubmissions(expandedId);
  }, [expandedId, loadSubmissions]);

  if (!events?.length) return null;

  return (
    <section className="admin-review-section">
      <h2>{t('review.title')}</h2>
      <p className="form-hint">{t('review.hint')}</p>
      <div className="review-events-list">
        {events.map((ev) => {
          const isOpen = expandedId === ev.id;
          const list = submissions[ev.id];
          return (
            <div key={ev.id} className="review-event-block">
              <button
                type="button"
                className="review-event-toggle"
                onClick={() => setExpandedId(isOpen ? null : ev.id)}
              >
                <span>{ev.topic}</span>
                <span className="muted">
                  {isOpen ? '▲' : '▼'} {list ? `${list.length} ${t('review.projects')}` : ''}
                </span>
              </button>
              {isOpen && (
                <div className="review-submissions">
                  {loading === ev.id && <p className="muted">{t('review.loading')}</p>}
                  {!loading && list?.length === 0 && (
                    <p className="muted">{t('review.empty')}</p>
                  )}
                  {list?.map((sub) => (
                    <SubmissionRow
                      key={sub.id}
                      submission={sub}
                      eventId={ev.id}
                      onRated={loadSubmissions}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
