import { useState, useEffect, useCallback } from 'react';
import { downloadPDF, copyText } from '../utils/exportUtils';

const STORAGE_KEY = 'toemrer_bygge_noter';

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveNotesToStorage(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function createEmptyNote() {
  const now = new Date().toISOString();
  return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), title: '', address: '', customer: '', text: '', created: now, updated: now };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('da-DK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ByggeNoter() {
  const [notes, setNotes] = useState([]);
  const [viewing, setViewing] = useState(null);   // note being viewed
  const [editing, setEditing] = useState(null);    // note being edited
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { setNotes(loadNotes()); }, []);

  const flash = useCallback((t) => { setMsg(t); setTimeout(() => setMsg(''), 2000); }, []);

  const filtered = notes
    .filter(n => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [n.title, n.address, n.customer, n.text].some(f => (f || '').toLowerCase().includes(q));
    })
    .sort((a, b) => new Date(b.updated) - new Date(a.updated));

  function doSave(note) {
    if (!note.title.trim()) { flash('Titel er påkrævet'); return; }
    const now = new Date().toISOString();
    const updated = { ...note, updated: now, created: note.created || now };
    const exists = notes.find(n => n.id === updated.id);
    const next = exists ? notes.map(n => n.id === updated.id ? updated : n) : [updated, ...notes];
    setNotes(next);
    saveNotesToStorage(next);
    setEditing(null);
    setViewing(updated);
    flash('Note gemt!');
  }

  function doDelete(id) {
    if (!window.confirm('Slet denne note?')) return;
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    saveNotesToStorage(next);
    setViewing(null);
    setEditing(null);
    flash('Note slettet');
  }

  function getPDFData(note) {
    return {
      title: note.title,
      inputs: { ...(note.address ? { Adresse: note.address } : {}), ...(note.customer ? { Kunde: note.customer } : {}) },
      results: {},
      notes: note.text,
    };
  }

  // ─── EDIT VIEW ───
  if (editing) {
    return (
      <div className="tool-page">
        <h2>{notes.find(n => n.id === editing.id) ? 'Rediger note' : 'Ny note'}</h2>
        <div className="card">
          <div className="form-group">
            <label>Titel *</label>
            <input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="F.eks. Tagudskiftning - Vestergade 12" />
          </div>
          <div className="form-group">
            <label>Adresse (valgfrit)</label>
            <input className="input" value={editing.address} onChange={e => setEditing({ ...editing, address: e.target.value })} placeholder="Projektadresse" />
          </div>
          <div className="form-group">
            <label>Kunde (valgfrit)</label>
            <input className="input" value={editing.customer} onChange={e => setEditing({ ...editing, customer: e.target.value })} placeholder="Kundenavn" />
          </div>
          <div className="form-group">
            <label>Noter</label>
            <textarea className="input" rows={10} value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })} placeholder="Skriv noter om projektet her..." />
          </div>
          {msg && <div className="action-msg">{msg}</div>}
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => doSave(editing)}>Gem note</button>
            <button className="btn" onClick={() => { setEditing(null); if (notes.find(n => n.id === editing.id)) setViewing(editing); }}>Annullér</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW NOTE ───
  if (viewing) {
    return (
      <div className="tool-page">
        <button className="btn btn-sm mb-2" onClick={() => setViewing(null)}>← Alle noter</button>

        <div className="note-view-card">
          <div className="note-view-header">
            <h2>{viewing.title || 'Uden titel'}</h2>
          </div>

          {(viewing.customer || viewing.address) && (
            <div className="note-view-meta">
              {viewing.customer && <div className="note-view-meta-item"><span className="note-view-meta-label">Kunde</span><span>{viewing.customer}</span></div>}
              {viewing.address && <div className="note-view-meta-item"><span className="note-view-meta-label">Adresse</span><span>{viewing.address}</span></div>}
            </div>
          )}

          <div className="note-view-dates">
            <span>Oprettet: {formatDate(viewing.created)}</span>
            {viewing.updated !== viewing.created && <span>Opdateret: {formatDate(viewing.updated)}</span>}
          </div>

          {viewing.text ? (
            <div className="note-view-body">{viewing.text}</div>
          ) : (
            <p className="text-muted" style={{ padding: '16px 0' }}>Ingen noter skrevet endnu.</p>
          )}
        </div>

        {msg && <div className="action-msg">{msg}</div>}

        <div className="action-buttons mt-2">
          <button className="btn btn-primary" onClick={() => setEditing({ ...viewing })}>Rediger</button>
          <button className="btn btn-sm" onClick={() => { downloadPDF(getPDFData(viewing)); flash('PDF downloadet'); }}>PDF</button>
          <button className="btn btn-sm" onClick={async () => { await copyText(getPDFData(viewing)); flash('Kopieret!'); }}>Kopiér</button>
          <button className="btn btn-sm btn-danger" onClick={() => doDelete(viewing.id)}>Slet</button>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div className="tool-page">
      <h2>Byggenoter</h2>
      <p className="text-muted mb-2">Hold styr på noter for dine byggeprojekter. Alt gemmes lokalt.</p>

      <div className="card">
        <button className="btn btn-primary mb-1" onClick={() => setEditing(createEmptyNote())}>+ Ny note</button>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Søg i noter..." />
      </div>

      {msg && <div className="action-msg">{msg}</div>}

      {filtered.length === 0 && (
        <div className="card"><p className="text-muted">{search ? 'Ingen noter matcher søgningen.' : 'Ingen noter endnu. Opret din første note!'}</p></div>
      )}

      {filtered.map(note => (
        <div key={note.id} className="note-card" onClick={() => setViewing(note)}>
          <h4>{note.title || 'Uden titel'}</h4>
          <div className="note-meta">
            {formatDate(note.updated)}
            {note.customer && <span> · {note.customer}</span>}
            {note.address && <span> · {note.address}</span>}
          </div>
          {note.text && <p className="note-preview">{note.text.length > 80 ? note.text.slice(0, 80) + '...' : note.text}</p>}
        </div>
      ))}
    </div>
  );
}
