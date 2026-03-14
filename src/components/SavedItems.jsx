import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedItems, deleteItem, duplicateItem } from '../utils/storage';
import { downloadPDF, downloadJSON, formatDate } from '../utils/exportUtils';
import { isFeatureLocked } from '../services/pro';
import ProBadge from './ProBadge';

const toolLabels = {
  materialeberegner: 'Materialeberegner',
  taghaeldning: 'Taghældning',
  'spaer-laengde': 'Spærlængde',
  'skruer-beslag': 'Skruer/Beslag',
  'maal-konverter': 'Mål-konverter',
  tilbudsberegner: 'Tilbudsberegner',
  materialeliste: 'Materialeliste',
  'bygge-noter': 'Byggenoter',
  'vaegt-beregner': 'Vægtberegner',
  skaereplan: 'Skæreplan',
};

export default function SavedItems({ filterType }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { refresh(); }, []);

  function refresh() {
    let all = getSavedItems();
    if (filterType) all = all.filter(i => i.toolType === filterType);
    setItems(all);
  }

  function handleDelete(id) {
    if (confirm('Slet denne beregning?')) {
      deleteItem(id);
      refresh();
    }
  }

  function handleDuplicate(id) {
    duplicateItem(id);
    refresh();
  }

  const filtered = items.filter(i =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.toolType?.toLowerCase().includes(search.toLowerCase())
  );

  if (!items.length) return <p className="text-muted">Ingen gemte beregninger{filterType ? ' for dette værktøj' : ''}.</p>;

  return (
    <div className="saved-items">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Søg i gemte..."
        className="input mb-2"
      />
      {filtered.map(item => (
        <div key={item.id} className="saved-card">
          <div className="saved-card-header">
            <div>
              <strong>{item.title}</strong>
              <span className="badge">{toolLabels[item.toolType] || item.toolType}</span>
            </div>
            <small className="text-muted">{formatDate(item.date)}</small>
          </div>
          {item.results && (
            <div className="saved-card-preview">
              {Object.entries(item.results).slice(0, 3).map(([k, v]) => (
                <span key={k} className="preview-item">{k}: {v}</span>
              ))}
            </div>
          )}
          <div className="saved-card-actions">
            <button onClick={() => navigate(`/${item.toolType}`, { state: { savedItem: item } })} className="btn btn-xs btn-primary">Åbn</button>
            {isFeatureLocked('pdf_export') ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="btn btn-xs btn-disabled">PDF</span>
                <ProBadge />
              </span>
            ) : (
              <button onClick={() => downloadPDF(item)} className="btn btn-xs">PDF</button>
            )}
            <button onClick={() => handleDuplicate(item.id)} className="btn btn-xs">Duplikér</button>
            <button onClick={() => handleDelete(item.id)} className="btn btn-xs btn-danger">Slet</button>
          </div>
        </div>
      ))}
    </div>
  );
}
