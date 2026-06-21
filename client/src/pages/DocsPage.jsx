import { useLocale } from '../context/LocaleContext.jsx';

const DOC_ITEMS = [
  { id: 'roles', titleKey: 'docs.items.roles.title', descKey: 'docs.items.roles.desc', tagKey: 'docs.items.roles.tag' },
  { id: 'teams', titleKey: 'docs.items.teams.title', descKey: 'docs.items.teams.desc', tagKey: 'docs.items.teams.tag' },
  { id: 'projects', titleKey: 'docs.items.projects.title', descKey: 'docs.items.projects.desc', tagKey: 'docs.items.projects.tag' },
  { id: 'events', titleKey: 'docs.items.events.title', descKey: 'docs.items.events.desc', tagKey: 'docs.items.events.tag' },
  { id: 'kvptk', titleKey: 'docs.items.kvptk.title', descKey: 'docs.items.kvptk.desc', tagKey: 'docs.items.kvptk.tag' },
  { id: 'jury', titleKey: 'docs.items.jury.title', descKey: 'docs.items.jury.desc', tagKey: 'docs.items.jury.tag' },
];

export default function DocsPage() {
  const { t } = useLocale();

  return (
    <div className="page docs-page">
      <header className="page-header">
        <h1>{t('docs.title')}</h1>
        <p>{t('docs.subtitle')}</p>
      </header>

      <div className="docs-grid">
        {DOC_ITEMS.map((item) => (
          <article key={item.id} className="doc-tile">
            <span className="doc-tag">{t(item.tagKey)}</span>
            <h3>{t(item.titleKey)}</h3>
            <p>{t(item.descKey)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
