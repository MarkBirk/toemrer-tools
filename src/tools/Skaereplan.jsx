import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';
import { getCalcDefaults } from '../utils/calcDefaults';

const COLORS = [
  '#4a90d9', '#e8734a', '#5cb85c', '#f0ad4e', '#d9534f',
  '#5bc0de', '#9b59b6', '#1abc9c', '#e67e22', '#3498db',
  '#e74c3c', '#2ecc71', '#f39c12', '#8e44ad', '#16a085',
];

export default function Skaereplan() {
  const location = useLocation();
  const d = getCalcDefaults().skaereplan;
  const [raaLaengde, setRaaLaengde] = useState(String(d.raaLaengde));
  const [snitBredde, setSnitBredde] = useState(String(d.snitBredde));
  const [stykLaengde, setStykLaengde] = useState('');
  const [stykAntal, setStykAntal] = useState('1');
  const [stykker, setStykker] = useState([]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const saved = location.state?.savedItem;
    if (saved?.inputs) {
      const inp = saved.inputs;
      const p = (v) => v ? v.replace(/[^\d.,]/g, '').replace(',', '.') : '';
      if (inp['Rålængde']) setRaaLaengde(p(inp['Rålængde']));
      if (inp['Snitbredde']) setSnitBredde(p(inp['Snitbredde']));
      if (inp['Emner']) {
        // Parse "600 mm × 4 stk, 300 mm × 2 stk" back into stykker array
        const parsed = inp['Emner'].split(',').map(s => {
          const match = s.trim().match(/(\d+)\s*mm\s*×\s*(\d+)\s*stk/);
          return match ? { laengde: parseInt(match[1], 10), antal: parseInt(match[2], 10) } : null;
        }).filter(Boolean);
        if (parsed.length > 0) setStykker(parsed);
      }
      return;
    }
    const shared = parseShareFromURL();
    if (shared && shared.inputs) {
      const inp = shared.inputs;
      if (inp.raaLaengde) setRaaLaengde(inp.raaLaengde);
      if (inp.snitBredde) setSnitBredde(inp.snitBredde);
      if (inp.stykker) setStykker(inp.stykker);
    }
  }, []);

  function tilfoejStyk() {
    const laengde = parseInt(stykLaengde, 10);
    const antal = parseInt(stykAntal, 10);
    if (!laengde || laengde <= 0 || !antal || antal <= 0) return;
    setStykker([...stykker, { laengde, antal }]);
    setStykLaengde('');
    setStykAntal('1');
    setResults(null);
  }

  function fjernStyk(idx) {
    setStykker(stykker.filter((_, i) => i !== idx));
    setResults(null);
  }

  function beregn() {
    const raw = parseInt(raaLaengde, 10);
    const kerf = parseInt(snitBredde, 10);
    if (!raw || raw <= 0 || kerf < 0 || stykker.length === 0) return;

    // 1. Expand pieces list
    const allePieces = [];
    stykker.forEach((s, origIdx) => {
      for (let i = 0; i < s.antal; i++) {
        allePieces.push({ laengde: s.laengde, origIdx });
      }
    });

    // 2. Sort descending
    allePieces.sort((a, b) => b.laengde - a.laengde);

    // 3. FFD bin packing
    const stocks = []; // each: { pieces: [{ laengde, origIdx }], remaining: number }

    allePieces.forEach(piece => {
      let placed = false;
      for (let i = 0; i < stocks.length; i++) {
        const needed = piece.laengde + (stocks[i].pieces.length > 0 ? kerf : 0);
        if (stocks[i].remaining >= needed) {
          stocks[i].pieces.push(piece);
          stocks[i].remaining -= needed;
          placed = true;
          break;
        }
      }
      if (!placed) {
        stocks.push({
          pieces: [piece],
          remaining: raw - piece.laengde,
        });
      }
    });

    // 4. Calculate totals
    const totalStocks = stocks.length;
    const totalRaw = totalStocks * raw;
    const totalUsed = allePieces.reduce((sum, p) => sum + p.laengde, 0);
    const totalKerf = allePieces.reduce((sum) => sum + kerf, 0) - (totalStocks * kerf);
    // More accurate waste: total raw - total used pieces - kerf between pieces
    const totalWaste = stocks.reduce((sum, s) => sum + s.remaining, 0);
    const wastePct = ((totalWaste / totalRaw) * 100).toFixed(1);

    setResults({
      stocks,
      totalStocks,
      totalWaste,
      wastePct,
      raw,
    });
  }

  function getInputs() {
    const inp = {
      'Rålængde': `${raaLaengde} mm`,
      'Snitbredde': `${snitBredde} mm`,
    };
    if (stykker.length > 0) {
      inp['Emner'] = stykker.map(s => `${s.laengde} mm × ${s.antal} stk`).join(', ');
    }
    return inp;
  }

  function getResultsList() {
    if (!results) return [];
    return [
      { label: 'Antal rålængder', value: `${results.totalStocks} stk` },
      { label: 'Samlet spild', value: `${results.totalWaste} mm (${results.wastePct}%)` },
    ];
  }

  function getMaterialList() {
    if (!results) return null;
    return [
      {
        name: `Rålængde (${raaLaengde} mm)`,
        amount: results.totalStocks,
        unit: 'stk',
        notes: `Spild: ${results.wastePct}%`,
      },
    ];
  }

  return (
    <div className="tool-page">
      <h1>Skæreplan-generator</h1>
      <p>Optimer dit udsnit fra rålængder med First Fit Decreasing bin packing. Minimér spild ved at fordele emner optimalt.</p>

      <div className="card">
        <div className="form-group">
          <label>Rålængde (mm)</label>
          <input
            type="number"
            className="input"
            value={raaLaengde}
            onChange={e => { setRaaLaengde(e.target.value); setResults(null); }}
            placeholder="F.eks. 4800"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Snitbredde / savsnit (mm)</label>
          <input
            type="number"
            className="input"
            value={snitBredde}
            onChange={e => { setSnitBredde(e.target.value); setResults(null); }}
            placeholder="F.eks. 3"
            min="0"
          />
        </div>
      </div>

      <div className="card">
        <h2>Tilføj emner</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
            <label>Længde (mm)</label>
            <input
              type="number"
              className="input"
              value={stykLaengde}
              onChange={e => setStykLaengde(e.target.value)}
              placeholder="F.eks. 600"
              min="1"
              onKeyDown={e => e.key === 'Enter' && tilfoejStyk()}
            />
          </div>
          <div className="form-group" style={{ flex: '0 0 80px', marginBottom: 0 }}>
            <label>Antal</label>
            <input
              type="number"
              className="input"
              value={stykAntal}
              onChange={e => setStykAntal(e.target.value)}
              placeholder="1"
              min="1"
              onKeyDown={e => e.key === 'Enter' && tilfoejStyk()}
            />
          </div>
          <button className="btn btn-primary" onClick={tilfoejStyk} style={{ marginBottom: '0' }}>
            Tilføj
          </button>
        </div>

        {stykker.length > 0 && (
          <table style={{ marginTop: '12px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Længde (mm)</th>
                <th style={{ textAlign: 'left' }}>Antal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stykker.map((s, i) => (
                <tr key={i}>
                  <td>{s.laengde} mm</td>
                  <td>{s.antal} stk</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => fjernStyk(i)}
                      style={{ color: '#d9534f' }}
                    >
                      Fjern
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {stykker.length > 0 && (
        <button className="btn btn-primary" onClick={beregn} style={{ marginTop: '8px' }}>
          Beregn skæreplan
        </button>
      )}

      {results && (
        <div className="results-card">
          <h2>Resultat</h2>

          <table>
            <tbody>
              {getResultsList().map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.label}</strong></td>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: '16px' }}>Skæreplan</h3>
          {results.stocks.map((stock, si) => (
            <div key={si} style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Rålængde #{si + 1} &mdash; Rest: {stock.remaining} mm
              </div>
              <div
                style={{
                  display: 'flex',
                  height: '36px',
                  border: '2px solid #333',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#e0e0e0',
                  position: 'relative',
                }}
              >
                {stock.pieces.map((p, pi) => {
                  const widthPct = (p.laengde / results.raw) * 100;
                  const kerfPct = pi < stock.pieces.length - 1
                    ? (parseInt(snitBredde, 10) / results.raw) * 100
                    : 0;
                  return (
                    <div key={pi} style={{ display: 'flex' }}>
                      <div
                        style={{
                          width: `${widthPct}vw`,
                          maxWidth: `${widthPct}%`,
                          flex: `0 0 ${widthPct}%`,
                          background: COLORS[p.origIdx % COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                        title={`${p.laengde} mm`}
                      >
                        {p.laengde}
                      </div>
                      {kerfPct > 0 && (
                        <div
                          style={{
                            flex: `0 0 ${kerfPct}%`,
                            background: '#333',
                          }}
                          title={`Savsnit ${snitBredde} mm`}
                        />
                      )}
                    </div>
                  );
                })}
                {/* Remaining waste area is the gray background showing through */}
              </div>
            </div>
          ))}

          <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ display: 'inline-block', width: '14px', height: '14px', background: '#e0e0e0', border: '1px solid #ccc', verticalAlign: 'middle', marginRight: '4px' }} />
            Spild
            <span style={{ display: 'inline-block', width: '14px', height: '14px', background: '#333', verticalAlign: 'middle', marginLeft: '12px', marginRight: '4px' }} />
            Savsnit
            {stykker.map((s, i) => (
              <span key={i} style={{ marginLeft: '12px' }}>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', background: COLORS[i % COLORS.length], verticalAlign: 'middle', marginRight: '4px' }} />
                {s.laengde} mm
              </span>
            ))}
          </div>

          <ResultActions
            toolType="skaereplan"
            toolPath="skaereplan"
            title="Skæreplan"
            inputs={getInputs()}
            results={getResultsList()}
            materialList={getMaterialList()}
            notes={`Rålængde: ${raaLaengde} mm, Snitbredde: ${snitBredde} mm`}
          />
        </div>
      )}
    </div>
  );
}
