import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ProjectGallery from '../components/ProjectGallery.jsx';
import GuestBanner from '../components/GuestBanner.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function ProjectsPage({ isGuest, onRequestLogin }) {
  const { t } = useLocale();
  const [projects, setProjects] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async (tags) => {
    try {
      const data = await api.getProjects(tags.length ? tags : null);
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const tagsData = await api.getTechTags();
        setAllTags(tagsData.tags || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    loadProjects(selectedTags);
  }, [selectedTags, loadProjects]);

  function handleTagToggle(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }

  async function handleCreateProject(payload) {
    await api.createProject(payload);
    await loadProjects(selectedTags);
    const tagsData = await api.getTechTags();
    setAllTags(tagsData.tags || []);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('projects.title')}</h1>
        <p>{t('projects.subtitle')}</p>
        {error && <p className="error inline">{error}</p>}
      </header>

      {isGuest && <GuestBanner onLogin={onRequestLogin} />}

      <ProjectGallery
        projects={projects}
        allTags={allTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearFilters={() => setSelectedTags([])}
        onCreateProject={handleCreateProject}
        onProjectsChanged={() => loadProjects(selectedTags)}
        isGuest={isGuest}
        onRequestLogin={onRequestLogin}
      />
    </div>
  );
}
