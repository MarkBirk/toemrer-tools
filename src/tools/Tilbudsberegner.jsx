import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';
import { getCalcDefaults } from '../utils/calcDefaults';
import { getAdminSettings } from '../utils/storage';
import { getData, STORAGE_KEYS, getSavedMaterialLists } from '../services/storage';

export default function Tilbudsberegner() {
  const location = useLocation();
  const d = getCalcDefaults().tilbud;
  const [materialomkostning, setMaterialomkostning] = useState('');
  const [timer, setTimer] = useState('');
  const [timepris, setTimepris] = useState(String(d.timepris));
  const [avancePct, setAvancePct] = useState(String(d.avancePct));
  const [momsPct, setMomsPct] = useState(String(d.momsPct));
  const [inkluderMoms, setInkluderMoms] = useState(true);
  const [inkluderAvance, setInkluderAvance] = useState(true);
  const [kundeNavn, setKundeNavn] = useState('');
  const [kundeAdresse, setKundeAdresse] = useState('');
  const [projektTitel, setProjektTitel] = useState('');
  const [noter, setNoter] = useState('');
  const [betalingsfrist, setBetalingsfrist] = useState('8');
  const [results, setResults] = useState(null);
  const [importMsg, setImportMsg] = useState('');
  const [showListPicker, setShowListPicker] = useState(false);

  function hentFraMaterialeliste() {
    const draft = getData(STORAGE_KEYS.MATERIALELISTE_DRAFT, null);
    const savedLists = getSavedMaterialLists();
    const hasDraft = draft && draft.grandTotal > 0;

    // If there are saved lists, show picker
    if (savedLists.length > 0) {
      setShowListPicker(true);
      return;
    }

    // Fallback: just use draft
    if (!hasDraft) {
      setImportMsg('Ingen materialeliste fundet. Opret en i Materialeliste-generatoren først.');
      setTimeout(() => setImportMsg(''), 3000);
      return;
    }
    importFromList(draft.grandTotal, 'materialelisten');
  }

  function importFromList(total, name) {
    setMaterialomkostning(String(Math.round(total * 100) / 100));
    setImportMsg(`Importeret ${total.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr. fra ${name}`);
    setShowListPicker(false);
    setTimeout(() => setImportMsg(''), 3000);
  }

  function hentFraTidsregistrering() {
    const sager = getData(STORAGE_KEYS.TIDSREGISTRERING, []);
    if (!sager.length) {
      setImportMsg('Ingen tidsregistrering fundet. Opret sager i Tidsregistrering først.');
      setTimeout(() => setImportMsg(''), 3000);
      return;
    }
    let totalMs = 0;
    for (const sag of sager) {
      for (const entry of sag.entries) {
        const end = entry.end || Date.now();
        totalMs += end - entry.start;
      }
    }
    const hours = Math.round((totalMs / 3600000) * 100) / 100;
    setTimer(String(hours));
    setImportMsg(`Importeret ${hours} timer fra tidsregistrering`);
    setTimeout(() => setImportMsg(''), 3000);
  }

  // Check for saved item or share data on mount
  useEffect(() => {
    const saved = location.state?.savedItem;
    if (saved?.inputs) {
      const inp = saved.inputs;
      if (inp['Materialomkostning']) setMaterialomkostning(inp['Materialomkostning'].replace(/[^\d.,]/g, '').replace(',', '.'));
      if (inp['Timer']) setTimer(inp['Timer']);
      if (inp['Timepris']) setTimepris(inp['Timepris'].replace(/[^\d.,]/g, '').replace(',', '.'));
      if (inp['Avance']) setAvancePct(inp['Avance'].replace(/[^\d.,]/g, '').replace(',', '.'));
      if (inp['Moms']) setMomsPct(inp['Moms'].replace(/[^\d.,]/g, '').replace(',', '.'));
      return;
    }
    const shared = parseShareFromURL();
    if (shared && shared.inputs) {
      const inp = shared.inputs;
      if (inp.materialomkostning) setMaterialomkostning(inp.materialomkostning);
      if (inp.timer) setTimer(inp.timer);
      if (inp.timepris) setTimepris(inp.timepris);
      if (inp.avancePct) setAvancePct(inp.avancePct);
      if (inp.momsPct) setMomsPct(inp.momsPct);
      if (inp.noter) setNoter(inp.noter);
    }
  }, []);

  function formatKr(n) {
    return n.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleBeregn() {
    const matCost = parseFloat(materialomkostning) || 0;
    const hours = parseFloat(timer) || 0;
    const hourlyRate = parseFloat(timepris) || 0;
    const markupPct = parseFloat(avancePct) || 0;
    const vatPct = parseFloat(momsPct) || 0;

    if (matCost === 0 && hours === 0) {
      setResults(null);
      return;
    }

    const arbejdsloen = hours * hourlyRate;
    const subtotal = matCost + arbejdsloen;
    const avance = inkluderAvance ? subtotal * markupPct / 100 : 0;
    const totalExMoms = subtotal + avance;
    const moms = inkluderMoms ? totalExMoms * vatPct / 100 : 0;
    const totalInklMoms = totalExMoms + moms;

    const tilbudstekst = genererTilbudstekst({
      matCost, arbejdsloen, subtotal, avance,
      totalExMoms, moms, totalInklMoms,
      markupPct, vatPct, hours, hourlyRate, noter,
      visMoms: inkluderMoms, visAvance: inkluderAvance,
    });

    setResults({
      materialer: matCost,
      arbejdsloen,
      subtotal,
      avance,
      avancePct: markupPct,
      totalExMoms,
      moms,
      momsPct: vatPct,
      totalInklMoms,
      tilbudstekst,
    });
  }

  function genererTilbudstekst({ matCost, arbejdsloen, subtotal, avance, totalExMoms, moms, totalInklMoms, markupPct, vatPct, hours, hourlyRate, noter, visMoms, visAvance }) {
    const lines = [
      '--- TILBUD ---',
      '',
    ];

    if (noter && noter.trim()) {
      lines.push('Beskrivelse:');
      lines.push(noter.trim());
      lines.push('');
    }

    lines.push('Specifikation:');
    lines.push(`  Materialer:            ${formatKr(matCost)} kr.`);
    lines.push(`  Arbejdsløn (${hours} t × ${formatKr(hourlyRate)} kr.): ${formatKr(arbejdsloen)} kr.`);
    lines.push(`  ----------------------------------`);
    lines.push(`  Subtotal:              ${formatKr(subtotal)} kr.`);
    if (visAvance) {
      lines.push(`  Avance (${markupPct}%):         ${formatKr(avance)} kr.`);
    }
    if (visAvance || visMoms) {
      lines.push(`  ----------------------------------`);
      lines.push(`  Total ex. moms:        ${formatKr(totalExMoms)} kr.`);
    }
    if (visMoms) {
      lines.push(`  Moms (${vatPct}%):             ${formatKr(moms)} kr.`);
    }
    lines.push(`  ==================================`);
    lines.push(`  ${visMoms ? 'TOTAL INKL. MOMS' : 'TOTAL'}:      ${formatKr(totalInklMoms)} kr.`);
    lines.push('');
    lines.push('---');

    return lines.join('\n');
  }

  const inputData = {
    'Materialomkostning': `${materialomkostning || 0} kr.`,
    'Timer': timer || '0',
    'Timepris': `${timepris} kr.`,
  };
  if (inkluderAvance) inputData['Avance'] = `${avancePct}%`;
  if (inkluderMoms) inputData['Moms'] = `${momsPct}%`;

  const resultData = results
    ? (() => {
        const d = {};
        d['Materialer'] = `${formatKr(results.materialer)} kr.`;
        d['Arbejdsløn'] = `${formatKr(results.arbejdsloen)} kr.`;
        d['Subtotal'] = `${formatKr(results.subtotal)} kr.`;
        if (inkluderAvance) d['Avance'] = `${formatKr(results.avance)} kr. (${results.avancePct}%)`;
        if (inkluderAvance || inkluderMoms) d['Total ex. moms'] = `${formatKr(results.totalExMoms)} kr.`;
        if (inkluderMoms) d['Moms'] = `${formatKr(results.moms)} kr. (${results.momsPct}%)`;
        d[inkluderMoms ? 'Total inkl. moms' : 'Total'] = `${formatKr(results.totalInklMoms)} kr.`;
        return d;
      })()
    : null;

  // Structured data for custom tilbud PDF
  const firma = getAdminSettings().firma || {};
  const tilbudDetaljer = results ? {
    materialer: results.materialer,
    timer: parseFloat(timer) || 0,
    timepris: parseFloat(timepris) || 0,
    arbejdsloen: results.arbejdsloen,
    subtotal: results.subtotal,
    avance: results.avance,
    avancePct: results.avancePct,
    totalExMoms: results.totalExMoms,
    moms: results.moms,
    momsPct: results.momsPct,
    totalInklMoms: results.totalInklMoms,
    inkluderMoms,
    inkluderAvance,
    noter,
    kundeNavn,
    kundeAdresse,
    projektTitel,
    betalingsfrist: parseInt(betalingsfrist) || 8,
    firma,
  } : null;

  return (
    <div className="tool-page">
      <h1>Tilbudsberegner</h1>
      <p>Beregn et hurtigt tilbud med materialer, arbejdsløn, avance og moms.</p>

      <div className="card">
        {importMsg && <div className="action-msg" style={{ marginBottom: '0.5rem' }}>{importMsg}</div>}

        <div className="form-group">
          <label>Materialomkostning (kr.)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              className="input"
              value={materialomkostning}
              onChange={e => setMaterialomkostning(e.target.value)}
              placeholder="0"
              min="0"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-sm btn-secondary" onClick={hentFraMaterialeliste} title="Hent total fra materialelisten">
              Hent fra liste
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Timer</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              className="input"
              value={timer}
              onChange={e => setTimer(e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-sm btn-secondary" onClick={hentFraTidsregistrering} title="Hent timer fra tidsregistrering">
              Hent timer
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Timepris (kr.)</label>
          <input
            type="number"
            className="input"
            value={timepris}
            onChange={e => setTimepris(e.target.value)}
            placeholder="450"
            min="0"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={inkluderAvance}
                onChange={e => setInkluderAvance(e.target.checked)}
                style={{ width: 'auto', accentColor: 'var(--accent)' }}
              />
              Avance (%)
            </label>
            {inkluderAvance && (
              <input
                type="number"
                className="input"
                value={avancePct}
                onChange={e => setAvancePct(e.target.value)}
                placeholder="15"
                min="0"
                max="100"
              />
            )}
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={inkluderMoms}
                onChange={e => setInkluderMoms(e.target.checked)}
                style={{ width: 'auto', accentColor: 'var(--accent)' }}
              />
              Moms (%)
            </label>
            {inkluderMoms && (
              <input
                type="number"
                className="input"
                value={momsPct}
                onChange={e => setMomsPct(e.target.value)}
                placeholder="25"
                min="0"
                max="100"
              />
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0.75rem 0' }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>Tilbuds-detaljer (vises i PDF)</p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Kundenavn</label>
            <input className="input" value={kundeNavn} onChange={e => setKundeNavn(e.target.value)} placeholder="Jens Jensen" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Projekttitel</label>
            <input className="input" value={projektTitel} onChange={e => setProjektTitel(e.target.value)} placeholder="Renovering af køkken" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Kundeadresse</label>
            <input className="input" value={kundeAdresse} onChange={e => setKundeAdresse(e.target.value)} placeholder="Vestergade 10, 2720 Vanløse" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Betalingsfrist (dage)</label>
            <input type="number" className="input" value={betalingsfrist} onChange={e => setBetalingsfrist(e.target.value)} placeholder="8" min="0" />
          </div>
        </div>

        <div className="form-group">
          <label>Beskrivelse af arbejdet</label>
          <textarea
            className="input"
            value={noter}
            onChange={e => setNoter(e.target.value)}
            placeholder="Tilbuddet omfatter:&#10;- Nedrivning af eksisterende køkken&#10;- Opsætning af nye skabe&#10;- Montering af bordplade"
            rows={4}
          />
        </div>

        <button className="btn btn-primary" onClick={handleBeregn}>
          Beregn tilbud
        </button>
      </div>

      {results && (
        <div className="results-card">
          <h2>Tilbudsoversigt</h2>

          <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.4rem 0' }}>Materialer</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.materialer)} kr.</td>
              </tr>
              <tr>
                <td style={{ padding: '0.4rem 0' }}>Arbejdsl&oslash;n</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.arbejdsloen)} kr.</td>
              </tr>
              <tr style={{ borderTop: '1px solid #ddd', fontWeight: '600' }}>
                <td style={{ padding: '0.4rem 0' }}>Subtotal</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.subtotal)} kr.</td>
              </tr>
              {inkluderAvance && (
                <tr>
                  <td style={{ padding: '0.4rem 0' }}>Avance ({results.avancePct}%)</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.avance)} kr.</td>
                </tr>
              )}
              {(inkluderAvance || inkluderMoms) && (
                <tr style={{ borderTop: '1px solid #ddd', fontWeight: '600' }}>
                  <td style={{ padding: '0.4rem 0' }}>Total ex. moms</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.totalExMoms)} kr.</td>
                </tr>
              )}
              {inkluderMoms && (
                <tr>
                  <td style={{ padding: '0.4rem 0' }}>Moms ({results.momsPct}%)</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.moms)} kr.</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <td style={{ padding: '0.6rem 0' }}>
                  {inkluderMoms ? 'TOTAL INKL. MOMS' : 'TOTAL'}
                </td>
                <td style={{ textAlign: 'right', padding: '0.6rem 0' }}>{formatKr(results.totalInklMoms)} kr.</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>Tilbudstekst</h3>
            <textarea
              className="input"
              value={results.tilbudstekst}
              readOnly
              rows={14}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem', width: '100%' }}
              onClick={e => e.target.select()}
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
              Klik i feltet for at markere alt &mdash; kopier med Ctrl+C
            </p>
          </div>

          <ResultActions
            toolType="tilbudsberegner"
            toolPath="tilbudsberegner"
            title="Tilbudsberegning"
            inputs={inputData}
            results={resultData}
            materialList={null}
            notes={noter}
            tilbudDetaljer={tilbudDetaljer}
          />
        </div>
      )}
      {showListPicker && (
        <div className="list-picker-overlay" onClick={() => setShowListPicker(false)}>
          <div className="list-picker" onClick={e => e.stopPropagation()}>
            <h3>Vælg materialeliste</h3>
            {(() => {
              const draft = getData(STORAGE_KEYS.MATERIALELISTE_DRAFT, null);
              const saved = getSavedMaterialLists();
              return (
                <>
                  {draft && draft.grandTotal > 0 && (
                    <div className="list-picker-item" onClick={() => importFromList(draft.grandTotal, 'nuværende kladde')}>
                      <div>
                        <strong>Nuværende kladde</strong>
                        <small className="text-muted" style={{ marginLeft: '0.5rem' }}>
                          {draft.list?.length || 0} poster
                        </small>
                      </div>
                      <strong>{draft.grandTotal.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</strong>
                    </div>
                  )}
                  {saved.map(sl => (
                    <div key={sl.id} className="list-picker-item" onClick={() => importFromList(sl.grandTotal, sl.name)}>
                      <div>
                        <strong>{sl.name}</strong>
                        <small className="text-muted" style={{ marginLeft: '0.5rem' }}>
                          {sl.list.length} poster
                        </small>
                      </div>
                      <strong>{sl.grandTotal.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.</strong>
                    </div>
                  ))}
                  {(!draft || !draft.grandTotal) && saved.length === 0 && (
                    <p className="text-muted">Ingen materialelister fundet.</p>
                  )}
                </>
              );
            })()}
            <button className="btn btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => setShowListPicker(false)}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  );
}
