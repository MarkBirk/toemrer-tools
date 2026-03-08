import { useState, useEffect } from 'react';
import { getMaterialList, removeMaterialListItem, clearMaterialList, updateMaterialList } from '../utils/storage';
import { downloadPDF, downloadCSV, downloadJSON, copyText, generateEmailHTML, getPDFBase64 } from '../utils/exportUtils';

export default function MaterialListCollector() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', amount: '', unit: 'stk', notes: '' });

  useEffect(() => { setList(getMaterialList()); }, []);

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 2000); }

  function handleRemove(id) {
    const updated = removeMaterialListItem(id);
    setList(updated);
  }

  function handleClear() {
    if (confirm('Ryd hele den samlede materialeliste?')) {
      clearMaterialList();
      setList([]);
    }
  }

  function handleAdd() {
    if (!newItem.name.trim() || !newItem.amount) return flash('Angiv materiale og mængde');
    const updated = [...list, {
      id: Date.now().toString(36),
      addedDate: new Date().toISOString(),
      source: 'Manuel',
      ...newItem
    }];
    updateMaterialList(updated);
    setList(updated);
    setNewItem({ name: '', amount: '', unit: 'stk', notes: '' });
  }

  const data = {
    title: 'Samlet materialeliste',
    materialList: list.map(i => ({
      name: i.name || i.materiale,
      amount: i.amount || i.antal,
      unit: i.unit || i.enhed,
      notes: `${i.notes || i.noter || ''} [${i.source || ''}]`.trim()
    }))
  };

  async function handleEmail() {
    if (!emailTo.trim()) return flash('Angiv modtager');
    setSending(true);
    try {
      const token = localStorage.getItem('toemrer_admin_token') || '';
      const apiUrl = localStorage.getItem('toemrer_api_url') || '/api';
      const res = await fetch(`${apiUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          to: emailTo.split(',').map(e => e.trim()),
          subject: 'Tømrer Tools: Samlet materialeliste',
          html: generateEmailHTML(data),
          pdfBase64: getPDFBase64(data),
          pdfFilename: 'samlet-materialeliste.pdf'
        })
      });
      const json = await res.json();
      flash(json.success ? 'E-mail sendt!' : (json.error || 'Fejl'));
    } catch { flash('Serverfejl'); }
    setSending(false);
  }

  return (
    <div className="tool-page">
      <h2>Samlet materialeliste</h2>
      <p className="text-muted">Materialer tilføjet fra forskellige beregninger samles her.</p>

      {msg && <div className="action-msg">{msg}</div>}

      {/* Add manual item */}
      <div className="card mb-2">
        <h4>Tilføj manuelt</h4>
        <div className="form-row">
          <input className="input" placeholder="Materiale" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          <input className="input input-sm" type="number" placeholder="Antal" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} />
          <select className="input input-sm" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
            <option value="stk">stk</option>
            <option value="m">m</option>
            <option value="m²">m²</option>
            <option value="m³">m³</option>
            <option value="kg">kg</option>
            <option value="pakke">pakke</option>
            <option value="rulle">rulle</option>
          </select>
        </div>
        <input className="input mb-1" placeholder="Noter (valgfrit)" value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} />
        <button onClick={handleAdd} className="btn btn-primary btn-sm">Tilføj</button>
      </div>

      {/* List */}
      {list.length === 0 ? (
        <p className="text-muted">Ingen materialer endnu. Brug "→ Samlet liste" fra et beregningsværktøj, eller tilføj manuelt.</p>
      ) : (
        <>
          <div className="material-table">
            <div className="material-header">
              <span>Materiale</span><span>Mængde</span><span>Enhed</span><span>Kilde</span><span></span>
            </div>
            {list.map(item => (
              <div key={item.id} className="material-row">
                <span>{item.name || item.materiale}</span>
                <span>{item.amount || item.antal}</span>
                <span>{item.unit || item.enhed}</span>
                <span className="text-muted">{item.source || ''}</span>
                <button onClick={() => handleRemove(item.id)} className="btn btn-xs btn-danger">×</button>
              </div>
            ))}
          </div>

          <div className="action-buttons mt-2">
            <button onClick={() => downloadPDF(data)} className="btn btn-sm">PDF</button>
            <button onClick={() => downloadCSV(data.materialList)} className="btn btn-sm">CSV</button>
            <button onClick={() => downloadJSON(data)} className="btn btn-sm">JSON</button>
            <button onClick={() => { copyText(data); flash('Kopieret!'); }} className="btn btn-sm">Kopiér</button>
            <button onClick={() => setShowEmail(!showEmail)} className="btn btn-sm btn-primary">E-mail</button>
            <button onClick={handleClear} className="btn btn-sm btn-danger">Ryd alt</button>
          </div>

          {showEmail && (
            <div className="action-panel">
              <input className="input" placeholder="modtager@email.dk" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
              <button onClick={handleEmail} disabled={sending} className="btn btn-primary">{sending ? 'Sender...' : 'Send'}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
