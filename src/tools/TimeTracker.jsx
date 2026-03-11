import { useState, useEffect, useRef } from 'react';
import ResultActions from '../components/ResultActions';
import { saveData, getData, STORAGE_KEYS } from '../services/storage';

const KEY = STORAGE_KEYS.TIDSREGISTRERING;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatTid(ms) {
  const totalSek = Math.floor(ms / 1000);
  const h = Math.floor(totalSek / 3600);
  const m = Math.floor((totalSek % 3600) / 60);
  const s = totalSek % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTimer(ms) {
  return (ms / 3600000).toFixed(2);
}

function akkumuleretTid(sag) {
  let total = 0;
  for (const entry of sag.entries) {
    const start = entry.start;
    const end = entry.end || Date.now();
    total += end - start;
  }
  return total;
}

function erAktiv(sag) {
  return sag.entries.some(e => !e.end);
}

export default function TimeTracker() {
  const [sager, setSager] = useState(() => getData(KEY, []));
  const [nySagNavn, setNySagNavn] = useState('');
  const [, setTick] = useState(0);
  const intervalRef = useRef(null);

  // Persist on change
  useEffect(() => {
    saveData(KEY, sager);
  }, [sager]);

  // Live tick every second when any sag is active
  useEffect(() => {
    const hasActive = sager.some(erAktiv);
    if (hasActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => setTick(t => t + 1), 1000);
    } else if (!hasActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sager]);

  function opretSag() {
    const navn = nySagNavn.trim();
    if (!navn) return;
    setSager(prev => [...prev, { id: generateId(), sagNavn: navn, entries: [] }]);
    setNySagNavn('');
  }

  function startTimer(sagId) {
    setSager(prev => prev.map(s => {
      if (s.id !== sagId || erAktiv(s)) return s;
      return { ...s, entries: [...s.entries, { start: Date.now(), end: null }] };
    }));
  }

  function stopTimer(sagId) {
    setSager(prev => prev.map(s => {
      if (s.id !== sagId) return s;
      return {
        ...s,
        entries: s.entries.map(e => e.end ? e : { ...e, end: Date.now() })
      };
    }));
  }

  function sletSag(sagId) {
    setSager(prev => prev.filter(s => s.id !== sagId));
  }

  function nulstilSag(sagId) {
    setSager(prev => prev.map(s => {
      if (s.id !== sagId) return s;
      return { ...s, entries: [] };
    }));
  }

  const totalMs = sager.reduce((sum, s) => sum + akkumuleretTid(s), 0);

  function formatKr(n) {
    return n.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const inputData = {
    'Antal sager': String(sager.length),
  };

  const resultData = sager.length > 0 ? (() => {
    const d = {};
    sager.forEach(s => {
      d[s.sagNavn] = `${formatTimer(akkumuleretTid(s))} timer`;
    });
    d['Total tid'] = `${formatTimer(totalMs)} timer`;
    return d;
  })() : null;

  return (
    <div className="tool-page">
      <h1>Tidsregistrering</h1>
      <p>Start og stop timere pr. sag. Timer akkumuleres automatisk.</p>

      <div className="card">
        <h2>Opret ny sag</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input"
            value={nySagNavn}
            onChange={e => setNySagNavn(e.target.value)}
            placeholder="Sagsnavn, f.eks. Køkkenrenovering"
            onKeyDown={e => e.key === 'Enter' && opretSag()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={opretSag}>Opret</button>
        </div>
      </div>

      {sager.length > 0 && (
        <div className="card">
          <h2>Sager ({sager.length})</h2>

          {sager.map(sag => {
            const aktiv = erAktiv(sag);
            const tidMs = akkumuleretTid(sag);
            return (
              <div key={sag.id} className="results-card" style={{ marginBottom: '0.75rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{sag.sagNavn}</strong>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '1.3rem',
                      color: aktiv ? 'var(--accent)' : 'var(--text-primary)',
                      marginTop: '0.25rem'
                    }}>
                      {formatTid(tidMs)}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        ({formatTimer(tidMs)} t)
                      </span>
                    </div>
                  </div>
                  <div className="action-buttons" style={{ flexShrink: 0 }}>
                    {aktiv ? (
                      <button className="btn btn-sm btn-danger" onClick={() => stopTimer(sag.id)}>
                        Stop
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-primary" onClick={() => startTimer(sag.id)}>
                        Start
                      </button>
                    )}
                    <button className="btn btn-sm" onClick={() => nulstilSag(sag.id)} title="Nulstil tid">
                      Nulstil
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => sletSag(sag.id)} title="Slet sag">
                      Slet
                    </button>
                  </div>
                </div>
                {sag.entries.length > 0 && (
                  <details style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <summary>{sag.entries.length} registrering{sag.entries.length !== 1 ? 'er' : ''}</summary>
                    <ul style={{ margin: '0.25rem 0', paddingLeft: '1.2rem' }}>
                      {sag.entries.map((e, i) => (
                        <li key={i}>
                          {new Date(e.start).toLocaleString('da-DK')}
                          {' → '}
                          {e.end ? new Date(e.end).toLocaleString('da-DK') : 'kører...'}
                          {' '}
                          ({formatTid(e.end ? e.end - e.start : Date.now() - e.start)})
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total alle sager: </span>
            <strong style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>{formatTid(totalMs)}</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
              ({formatTimer(totalMs)} timer)
            </span>
          </div>
        </div>
      )}

      {sager.length > 0 && resultData && (
        <div className="results-card">
          <h2>Opsummering</h2>
          <table>
            <tbody>
              {Object.entries(resultData).map(([k, v]) => (
                <tr key={k} style={k === 'Total tid' ? { borderTop: '2px solid var(--border)', fontWeight: 'bold' } : {}}>
                  <td><strong>{k}</strong></td>
                  <td style={{ textAlign: 'right' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ResultActions
            toolType="tidsregistrering"
            toolPath="tidsregistrering"
            title="Tidsregistrering"
            inputs={inputData}
            results={resultData}
            materialList={null}
            notes={null}
          />
        </div>
      )}
    </div>
  );
}
