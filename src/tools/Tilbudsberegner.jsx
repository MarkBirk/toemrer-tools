import { useState, useEffect } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';

export default function Tilbudsberegner() {
  const [materialomkostning, setMaterialomkostning] = useState('');
  const [timer, setTimer] = useState('');
  const [timepris, setTimepris] = useState('450');
  const [avancePct, setAvancePct] = useState('15');
  const [momsPct, setMomsPct] = useState('25');
  const [noter, setNoter] = useState('');
  const [results, setResults] = useState(null);

  // Check for share data on mount
  useEffect(() => {
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
    const avance = subtotal * markupPct / 100;
    const totalExMoms = subtotal + avance;
    const moms = totalExMoms * vatPct / 100;
    const totalInklMoms = totalExMoms + moms;

    const tilbudstekst = genererTilbudstekst({
      matCost, arbejdsloen, subtotal, avance,
      totalExMoms, moms, totalInklMoms,
      markupPct, vatPct, hours, hourlyRate, noter,
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

  function genererTilbudstekst({ matCost, arbejdsloen, subtotal, avance, totalExMoms, moms, totalInklMoms, markupPct, vatPct, hours, hourlyRate, noter }) {
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
    lines.push(`  Avance (${markupPct}%):         ${formatKr(avance)} kr.`);
    lines.push(`  ----------------------------------`);
    lines.push(`  Total ex. moms:        ${formatKr(totalExMoms)} kr.`);
    lines.push(`  Moms (${vatPct}%):             ${formatKr(moms)} kr.`);
    lines.push(`  ==================================`);
    lines.push(`  TOTAL INKL. MOMS:      ${formatKr(totalInklMoms)} kr.`);
    lines.push('');
    lines.push('---');

    return lines.join('\n');
  }

  const inputData = {
    materialomkostning,
    timer,
    timepris,
    avancePct,
    momsPct,
    noter,
  };

  const resultData = results
    ? {
        materialer: `${formatKr(results.materialer)} kr.`,
        arbejdsloen: `${formatKr(results.arbejdsloen)} kr.`,
        subtotal: `${formatKr(results.subtotal)} kr.`,
        avance: `${formatKr(results.avance)} kr. (${results.avancePct}%)`,
        totalExMoms: `${formatKr(results.totalExMoms)} kr.`,
        moms: `${formatKr(results.moms)} kr. (${results.momsPct}%)`,
        totalInklMoms: `${formatKr(results.totalInklMoms)} kr.`,
      }
    : null;

  return (
    <div className="tool-page">
      <h1>Tilbudsberegner</h1>
      <p>Beregn et hurtigt tilbud med materialer, arbejdsløn, avance og moms.</p>

      <div className="card">
        <div className="form-group">
          <label>Materialomkostning (kr.)</label>
          <input
            type="number"
            className="input"
            value={materialomkostning}
            onChange={e => setMaterialomkostning(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Timer</label>
          <input
            type="number"
            className="input"
            value={timer}
            onChange={e => setTimer(e.target.value)}
            placeholder="0"
            min="0"
            step="0.5"
          />
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Avance (%)</label>
            <input
              type="number"
              className="input"
              value={avancePct}
              onChange={e => setAvancePct(e.target.value)}
              placeholder="15"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Moms (%)</label>
            <input
              type="number"
              className="input"
              value={momsPct}
              onChange={e => setMomsPct(e.target.value)}
              placeholder="25"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Noter / beskrivelse</label>
          <textarea
            className="input"
            value={noter}
            onChange={e => setNoter(e.target.value)}
            placeholder="Valgfri beskrivelse af arbejdet..."
            rows={3}
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
              <tr>
                <td style={{ padding: '0.4rem 0' }}>Avance ({results.avancePct}%)</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.avance)} kr.</td>
              </tr>
              <tr style={{ borderTop: '1px solid #ddd', fontWeight: '600' }}>
                <td style={{ padding: '0.4rem 0' }}>Total ex. moms</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.totalExMoms)} kr.</td>
              </tr>
              <tr>
                <td style={{ padding: '0.4rem 0' }}>Moms ({results.momsPct}%)</td>
                <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatKr(results.moms)} kr.</td>
              </tr>
              <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <td style={{ padding: '0.6rem 0' }}>TOTAL INKL. MOMS</td>
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
          />
        </div>
      )}
    </div>
  );
}
