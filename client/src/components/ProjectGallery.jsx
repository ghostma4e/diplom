import { useEffect, useState } from 'react';

import { useLocale } from '../context/LocaleContext.jsx';

import { api } from '../api/client.js';



function normalizeGithub(url) {

  if (!url?.trim()) return null;

  const u = url.trim();

  if (/^https?:\/\//i.test(u)) return u;

  return `https://${u}`;

}



export default function ProjectGallery({

  projects,

  allTags,

  selectedTags,

  onTagToggle,

  onClearFilters,

  onCreateProject,
  onProjectsChanged,
  isGuest = false,
  onRequestLogin,
}) {

  const { t } = useLocale();

  const [projectName, setProjectName] = useState('');

  const [description, setDescription] = useState('');

  const [techStack, setTechStack] = useState('');

  const [githubUrl, setGithubUrl] = useState('');

  const [eventId, setEventId] = useState('');

  const [myEvents, setMyEvents] = useState([]);

  const [linkingId, setLinkingId] = useState(null);

  const [formError, setFormError] = useState('');

  const [submitting, setSubmitting] = useState(false);



  const filteredCount = projects?.length ?? 0;



  useEffect(() => {

    if (isGuest) return;

    api

      .getMyParticipations()

      .then((data) => {

        const list = (data.participations || [])

          .map((p) => p.hackathon_events)

          .filter(Boolean);

        setMyEvents(list);

      })

      .catch(() => setMyEvents([]));

  }, [isGuest]);



  async function handleCreate(event) {

    event.preventDefault();

    setFormError('');

    setSubmitting(true);

    try {

      await onCreateProject({

        projectName,

        description,

        techStack,

        githubUrl: normalizeGithub(githubUrl),

        eventId: eventId || undefined,

      });

      setProjectName('');

      setDescription('');

      setTechStack('');

      setGithubUrl('');

      setEventId('');

    } catch (err) {

      setFormError(err.message);

    } finally {

      setSubmitting(false);

    }

  }



  async function handleLinkProject(projectId, newEventId) {

    setLinkingId(projectId);

    setFormError('');

    try {

      await api.linkProjectToEvent(projectId, newEventId || null);
      await onProjectsChanged?.();

    } catch (err) {

      setFormError(err.message);

    } finally {

      setLinkingId(null);

    }

  }



  return (

    <section className="gallery-section">

      <div className="gallery-toolbar">

        <div>

          <h2>{t('projects.gallery')}</h2>

          <span className="badge">{t('projects.count', { count: filteredCount })}</span>

        </div>

      </div>



      <div className="filter-bar">

        {(allTags || []).map((tag) => (

          <button

            key={tag}

            type="button"

            className={`chip ${selectedTags.includes(tag) ? 'active' : ''}`}

            onClick={() => onTagToggle(tag)}

          >

            {tag}

          </button>

        ))}

        {selectedTags.length > 0 && (

          <button type="button" className="chip clear" onClick={onClearFilters}>

            {t('projects.reset')}

          </button>

        )}

      </div>



      {isGuest ? (

        <div className="project-form-card guest-only">

          <p>{t('projects.guestOnly')}</p>

          <button type="button" className="btn-primary" onClick={onRequestLogin}>

            {t('auth.loginToParticipate')}

          </button>

        </div>

      ) : (

        <form className="project-form-card" onSubmit={handleCreate}>

          <h3>{t('projects.add')}</h3>

          <div className="form-grid-2">

            <label>

              {t('projects.namePh')}

              <input

                value={projectName}

                onChange={(e) => setProjectName(e.target.value)}

                required

              />

            </label>

            <label>

              {t('projects.githubPh')}

              <input

                value={githubUrl}

                onChange={(e) => setGithubUrl(e.target.value)}

                placeholder="https://github.com/user/repo"

              />

            </label>

          </div>

          {myEvents.length > 0 && (

            <label>

              {t('projects.eventPh')}

              <select value={eventId} onChange={(e) => setEventId(e.target.value)}>

                <option value="">{t('projects.noEvent')}</option>

                {myEvents.map((ev) => (

                  <option key={ev.id} value={ev.id}>

                    {ev.topic}

                  </option>

                ))}

              </select>

            </label>

          )}

          {myEvents.length === 0 && (

            <p className="form-hint">{t('projects.joinEventHint')}</p>

          )}

          <label>

            {t('projects.descPh')}

            <textarea

              value={description}

              onChange={(e) => setDescription(e.target.value)}

              required

              rows={3}

            />

          </label>

          <label>

            {t('projects.stackPh')}

            <input

              value={techStack}

              onChange={(e) => setTechStack(e.target.value)}

              required

            />

          </label>

          {formError && <p className="error">{formError}</p>}

          <button type="submit" className="btn-primary submit-wide" disabled={submitting}>

            {submitting ? t('projects.saving') : t('projects.add')}

          </button>

        </form>

      )}



      <div className="project-grid">

        {(projects || []).map((project) => (

          <article key={project.id} className="project-card-v2">

            <div className="project-card-top">

              <h3>{project.project_name}</h3>

              <span className="team-pill">{project.teams?.team_name || '—'}</span>

            </div>

            <div
              className={`project-event-banner ${project.hackathon_events?.topic ? 'linked' : ''}`}
            >
              <span className="project-event-label">{t('projects.linkedEvent')}</span>
              <span className="project-event-name">
                {project.hackathon_events?.topic || t('projects.notLinkedEvent')}
              </span>
            </div>

            {project.rating?.score != null && (
              <div className="project-score-breakdown">
                <span className="project-score-pill">
                  {t('projects.juryScore')}: <strong>{project.rating.score}</strong>/100
                </span>
                {project.rating.score_design != null && (
                  <ul className="score-criteria-mini">
                    <li>
                      {t('review.design')}: {project.rating.score_design}
                    </li>
                    <li>
                      {t('review.technical')}: {project.rating.score_technical}
                    </li>
                    <li>
                      {t('review.tasks')}: {project.rating.score_tasks}
                    </li>
                  </ul>
                )}
              </div>
            )}

            <p className="project-desc">{project.description}</p>

            <div className="tags">

              {(project.tech_stack || []).map((tag) => (

                <span key={tag} className="chip small">

                  {tag}

                </span>

              ))}

            </div>

            {!isGuest && myEvents.length > 0 && (

              <label className="project-link-event">

                {t('projects.linkEvent')}

                <select

                  value={project.event_id || ''}

                  disabled={linkingId === project.id}

                  onChange={(e) => handleLinkProject(project.id, e.target.value)}

                >

                  <option value="">{t('projects.noEvent')}</option>

                  {myEvents.map((ev) => (

                    <option key={ev.id} value={ev.id}>

                      {ev.topic}

                    </option>

                  ))}

                </select>

              </label>

            )}

            {project.github_url && (

              <a

                href={project.github_url}

                target="_blank"

                rel="noopener noreferrer"

                className="github-link"

              >

                {t('projects.viewGithub')}

              </a>

            )}

          </article>

        ))}

        {!projects?.length && <p className="muted empty-projects">{t('projects.noProjects')}</p>}

      </div>

    </section>

  );

}

