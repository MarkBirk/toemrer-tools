import { useState } from 'react';
import { saveItem, addToMaterialList } from '../utils/storage';
import { downloadPDF, downloadCSV, downloadJSON, copyText, generateEmailHTML, getPDFBase64 } from '../utils/exportUtils';
import { copyShareLink } from '../utils/shareLink';

export default function ResultActions({ toolType, toolPath, title, inputs, results, materialList, notes, onSaved }) {
  const [saveTitle, setSaveTitle] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [msg, setMsg] = useState('');

  const data = { title: saveTitle || title, inputs, results, materialList, notes };

  function handleSave() {
    if (!saveTitle.trim()) return setMsg('Angiv en titel');
    const item = saveItem({ title: saveTitle.trim(), toolType, inputs, results, materialList, notes });
    setMsg('Gemt!');
    setShowSave(false);
    setSaveTitle('');
    if (onSaved) onSaved(item);
    setTimeout(() => setMsg(''), 2000);
  }

  function handleAddToList() {
    if (!materialList || !materialList.length) return setMsg('Ingen materialer at tilføje');
    addToMaterialList(materialList, title);
    setMsg('Tilføjet til samlet materialeliste!');
    setTimeout(() => setMsg(''), 2000);
  }

  async function handleCopy() {
    await copyText(data);
    setMsg('Kopieret!');
    setTimeout(() => setMsg(''), 2000);
  }

  async function handleShare() {
    const ok = await copyShareLink(toolPath, { inputs });
    setMsg(ok ? 'Delelink kopieret!' : 'Kunne ikke generere link');
    setTimeout(() => setMsg(''), 2000);
  }

  async function handleEmail() {
    if (!emailTo.trim()) return setMsg('Angiv modtager');
    const recipients = emailTo.split(',').map(e => e.trim()).filter(Boolean);
    setEmailSending(true);
    try {
      const adminToken = localStorage.getItem('toemrer_admin_token') || '';
      const apiUrl = localStorage.getItem('toemrer_api_url') || '/api';
      const pdfBase64 = getPDFBase64(data);
      const res = await fetch(`${apiUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({
          to: recipients,
          subject: `Tømrer Tools: ${data.title}`,
          html: generateEmailHTML(data),
          text: '',
          pdfBase64,
          pdfFilename: `${data.title || 'beregning'}.pdf`
        })
      });
      const json = await res.json();
      setMsg(json.success ? 'E-mail sendt!' : (json.error || 'Fejl'));
    } catch {
      setMsg('Kunne ikke sende. Tjek server-forbindelse.');
    }
    setEmailSending(false);
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div className="result-actions">
      {msg && <div className="action-msg">{msg}</div>}

      <div className="action-buttons">
        <button onClick={() => downloadPDF(data)} className="btn btn-sm">PDF</button>
        {materialList && materialList.length > 0 && (
          <button onClick={() => downloadCSV(materialList)} className="btn btn-sm">CSV</button>
        )}
        <button onClick={() => downloadJSON({ toolType, ...data })} className="btn btn-sm">JSON</button>
        <button onClick={handleCopy} className="btn btn-sm">Kopiér</button>
        <button onClick={handleShare} className="btn btn-sm">Delelink</button>
        {materialList && materialList.length > 0 && (
          <button onClick={handleAddToList} className="btn btn-sm btn-secondary">+ Samlet liste</button>
        )}
      </div>

      <div className="action-expand-row">
        <button onClick={() => { setShowSave(!showSave); setShowEmail(false); }} className="btn btn-sm btn-primary">
          {showSave ? 'Annuller' : 'Gem'}
        </button>
        <button onClick={() => { setShowEmail(!showEmail); setShowSave(false); }} className="btn btn-sm btn-primary">
          {showEmail ? 'Annuller' : 'E-mail'}
        </button>
      </div>

      {showSave && (
        <div className="action-panel">
          <input
            type="text"
            value={saveTitle}
            onChange={e => setSaveTitle(e.target.value)}
            placeholder="Titel på beregning..."
            className="input"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="btn btn-primary">Gem beregning</button>
        </div>
      )}

      {showEmail && (
        <div className="action-panel">
          <input
            type="text"
            value={emailTo}
            onChange={e => setEmailTo(e.target.value)}
            placeholder="modtager@email.dk (kommasepareret)"
            className="input"
          />
          <button onClick={handleEmail} disabled={emailSending} className="btn btn-primary">
            {emailSending ? 'Sender...' : 'Send e-mail (med PDF)'}
          </button>
        </div>
      )}
    </div>
  );
}
