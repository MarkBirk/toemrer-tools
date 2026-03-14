import { useState } from 'react';
import SEO from '../components/SEO';
import ToolCard from '../components/ToolCard';
import tools from '../data/tools';

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const filtered = tools.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tool-page">
      <SEO
        title="Alle værktøjer"
        description="Oversigt over alle 14 gratis beregningsværktøjer til håndværkere: materialeberegner, taghældning, skæreplan, tilbudsberegner og mere."
        path="/vaerktoejer"
      />
      <h1>Alle værktøjer</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        {tools.length} gratis værktøjer bygget til det danske håndværk.
      </p>
      <div className="search-bar">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Søg værktøj..."
          className="input search-input"
        />
      </div>
      <div className="tools-grid">
        {filtered.map(t => (
          <ToolCard key={t.path} {...t} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted text-center">Ingen værktøjer matcher søgningen.</p>
      )}
    </div>
  );
}
