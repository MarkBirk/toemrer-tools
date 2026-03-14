import { useState, useEffect, useRef } from 'react';
import ResultActions from '../components/ResultActions';
import { saveData, getData, STORAGE_KEYS } from '../services/storage';

const KEY = STORAGE_KEYS.DOC_CHECKLISTS;
const MAX_BILLEDER = 3;

const DEFAULT_KATEGORIER = [
  {
    navn: 'Tilstand før arbejde',
    punkter: [
      'Fotograferet eksisterende tilstand (alle berørte rum/områder)',
      'Dokumenteret synlige skader eller mangler',
      'Noteret eksisterende installationer (el, vvs, ventilation)',
    ]
  },
  {
    navn: 'Skjulte installationer',
    punkter: [
      'Kontrolleret for skjulte rør og kabler',
      'Dokumenteret fund bag vægge/gulve/lofter',
      'Noteret uventede konstruktioner',
    ]
  },
  {
    navn: 'Afvigelser fra aftale',
    punkter: [
      'Dokumenteret ændringer aftalt med kunde',
      'Fotograferet årsag til ændring',
      'Kunden informeret og godkendt (skriftligt)',
    ]
  },
  {
    navn: 'Materialer brugt',
    punkter: [
      'Fotograferet materialer inden montering',
      'Noteret batchnumre/produktnavne',
      'Dokumenteret evt. materialeændringer',
    ]
  },
  {
    navn: 'Afsluttende inspektion',
    punkter: [
      'Fotograferet færdigt resultat (alle vinkler)',
      'Kontrolleret mål og tolerancer',
      'Opryddet arbejdsområde',
      'Kunden godkendt arbejdet',
    ]
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocChecklist() {
  const [projekter, setProjekter] = useState(() => getData(KEY, []));
  const [aktivtProjektId, setAktivtProjektId] = useState(null);
  const [nytProjektNavn, setNytProjektNavn] = useState('');
  const [nytPunktTekst, setNytPunktTekst] = useState('');
  const [nytPunktKategori, setNytPunktKategori] = useState(0);
  const [visBillede, setVisBillede] = useState(null); // { katIdx, punktId, billedeIdx }
  const fileInputRef = useRef(null);
  const uploadTarget = useRef(null); // { katIdx, punktId }

  useEffect(() => {
    saveData(KEY, projekter);
  }, [projekter]);

  const aktivtProjekt = projekter.find(p => p.id === aktivtProjektId);

  function opretProjekt() {
    const navn = nytProjektNavn.trim();
    if (!navn) return;
    const nytProjekt = {
      id: generateId(),
      navn,
      oprettet: new Date().toISOString(),
      kategorier: DEFAULT_KATEGORIER.map(k => ({
        navn: k.navn,
        punkter: k.punkter.map(p => ({ id: generateId(), tekst: p, checked: false, custom: false, billeder: [] }))
      }))
    };
    setProjekter(prev => [...prev, nytProjekt]);
    setAktivtProjektId(nytProjekt.id);
    setNytProjektNavn('');
  }

  function sletProjekt(id) {
    setProjekter(prev => prev.filter(p => p.id !== id));
    if (aktivtProjektId === id) setAktivtProjektId(null);
  }

  function togglePunkt(katIdx, punktId) {
    setProjekter(prev => prev.map(p => {
      if (p.id !== aktivtProjektId) return p;
      const kategorier = p.kategorier.map((k, ki) => {
        if (ki !== katIdx) return k;
        return {
          ...k,
          punkter: k.punkter.map(pt => pt.id === punktId ? { ...pt, checked: !pt.checked } : pt)
        };
      });
      return { ...p, kategorier };
    }));
  }

  function tilfoejPunkt() {
    const tekst = nytPunktTekst.trim();
    if (!tekst) return;
    setProjekter(prev => prev.map(p => {
      if (p.id !== aktivtProjektId) return p;
      const kategorier = p.kategorier.map((k, ki) => {
        if (ki !== nytPunktKategori) return k;
        return {
          ...k,
          punkter: [...k.punkter, { id: generateId(), tekst, checked: false, custom: true, billeder: [] }]
        };
      });
      return { ...p, kategorier };
    }));
    setNytPunktTekst('');
  }

  function fjernPunkt(katIdx, punktId) {
    setProjekter(prev => prev.map(p => {
      if (p.id !== aktivtProjektId) return p;
      const kategorier = p.kategorier.map((k, ki) => {
        if (ki !== katIdx) return k;
        return { ...k, punkter: k.punkter.filter(pt => pt.id !== punktId) };
      });
      return { ...p, kategorier };
    }));
  }

  function startUpload(katIdx, punktId) {
    uploadTarget.current = { katIdx, punktId };
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget.current) return;
    try {
      const dataUrl = await compressImage(file);
      const { katIdx, punktId } = uploadTarget.current;
      setProjekter(prev => prev.map(p => {
        if (p.id !== aktivtProjektId) return p;
        const kategorier = p.kategorier.map((k, ki) => {
          if (ki !== katIdx) return k;
          return {
            ...k,
            punkter: k.punkter.map(pt => {
              if (pt.id !== punktId) return pt;
              if ((pt.billeder || []).length >= MAX_BILLEDER) return pt;
              return {
                ...pt,
                billeder: [...(pt.billeder || []), { id: generateId(), dataUrl, dato: new Date().toISOString() }]
              };
            })
          };
        });
        return { ...p, kategorier };
      }));
    } catch (err) {
      console.warn('Billedupload fejlede:', err);
    }
  }

  function sletBillede(katIdx, punktId, billedeId) {
    setProjekter(prev => prev.map(p => {
      if (p.id !== aktivtProjektId) return p;
      const kategorier = p.kategorier.map((k, ki) => {
        if (ki !== katIdx) return k;
        return {
          ...k,
          punkter: k.punkter.map(pt => {
            if (pt.id !== punktId) return pt;
            return { ...pt, billeder: (pt.billeder || []).filter(b => b.id !== billedeId) };
          })
        };
      });
      return { ...p, kategorier };
    }));
    setVisBillede(null);
  }

  // Progress calculation
  function beregnFremskridt(projekt) {
    let total = 0, checked = 0;
    for (const kat of projekt.kategorier) {
      for (const pt of kat.punkter) {
        total++;
        if (pt.checked) checked++;
      }
    }
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  }

  // Result data for export
  function getResultData() {
    if (!aktivtProjekt) return null;
    const d = {};
    d['Projekt'] = aktivtProjekt.navn;
    d['Fremskridt'] = `${beregnFremskridt(aktivtProjekt)}%`;
    aktivtProjekt.kategorier.forEach(k => {
      const checked = k.punkter.filter(p => p.checked).length;
      d[k.navn] = `${checked}/${k.punkter.length}`;
    });
    return d;
  }

  function getInputData() {
    if (!aktivtProjekt) return {};
    return { 'Projekt': aktivtProjekt.navn, 'Oprettet': new Date(aktivtProjekt.oprettet).toLocaleDateString('da-DK') };
  }

  // Get image for modal view
  const visningsBillede = visBillede && aktivtProjekt
    ? aktivtProjekt.kategorier[visBillede.katIdx]?.punkter.find(p => p.id === visBillede.punktId)?.billeder?.[visBillede.billedeIdx]
    : null;

  return (
    <div className="tool-page">
      <h1>Dokumentationstjekliste</h1>
      <p>Systematisk fotodokumentation pr. byggeprojekt.</p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div className="card">
        <h2>Vælg eller opret projekt</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            className="input"
            value={nytProjektNavn}
            onChange={e => setNytProjektNavn(e.target.value)}
            placeholder="Nyt projektnavn..."
            onKeyDown={e => e.key === 'Enter' && opretProjekt()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={opretProjekt}>Opret</button>
        </div>

        {projekter.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {projekter.map(p => {
              const pct = beregnFremskridt(p);
              const isActive = p.id === aktivtProjektId;
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: '8px',
                  background: isActive ? 'var(--accent-light, rgba(45,100,60,0.1))' : 'var(--bg-card)',
                  border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-light)',
                  cursor: 'pointer'
                }} onClick={() => setAktivtProjektId(p.id)}>
                  <div style={{ flex: 1 }}>
                    <strong>{p.navn}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {pct}% færdig
                    </div>
                  </div>
                  <div style={{
                    width: '50px', height: '6px', background: 'var(--border-light)',
                    borderRadius: '3px', overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: pct === 100 ? '#27ae60' : 'var(--accent)',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); sletProjekt(p.id); }}>
                    Slet
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {aktivtProjekt && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>{aktivtProjekt.navn}</h2>
              <span style={{
                background: beregnFremskridt(aktivtProjekt) === 100 ? '#27ae60' : 'var(--accent)',
                color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600
              }}>
                {beregnFremskridt(aktivtProjekt)}%
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%', height: '8px', background: 'var(--border-light)',
              borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem'
            }}>
              <div style={{
                width: `${beregnFremskridt(aktivtProjekt)}%`, height: '100%',
                background: beregnFremskridt(aktivtProjekt) === 100 ? '#27ae60' : 'var(--accent)',
                transition: 'width 0.3s'
              }} />
            </div>

            {aktivtProjekt.kategorier.map((kat, katIdx) => {
              const checked = kat.punkter.filter(p => p.checked).length;
              const total = kat.punkter.length;
              return (
                <div key={katIdx} style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{kat.navn}</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.8rem' }}>
                      {checked}/{total}
                    </span>
                  </h3>
                  {kat.punkter.map(punkt => {
                    const billeder = punkt.billeder || [];
                    const kanUploade = billeder.length < MAX_BILLEDER;
                    return (
                      <div key={punkt.id} className="doc-punkt-wrapper">
                        <label className="doc-punkt-label">
                          <input
                            type="checkbox"
                            checked={punkt.checked}
                            onChange={() => togglePunkt(katIdx, punkt.id)}
                          />
                          <span style={{
                            flex: 1,
                            textDecoration: punkt.checked ? 'line-through' : 'none',
                            color: punkt.checked ? 'var(--text-secondary)' : 'var(--text-primary)',
                          }}>{punkt.tekst}</span>
                          <button
                            className="doc-image-btn"
                            onClick={e => { e.preventDefault(); if (kanUploade) startUpload(katIdx, punkt.id); }}
                            disabled={!kanUploade}
                            title={kanUploade ? 'Tilføj billede' : `Max ${MAX_BILLEDER} billeder`}
                            type="button"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            {billeder.length > 0 && (
                              <span className="doc-image-count">{billeder.length}/{MAX_BILLEDER}</span>
                            )}
                          </button>
                          {punkt.custom && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={e => { e.preventDefault(); fjernPunkt(katIdx, punkt.id); }}
                              style={{ padding: '0 0.3rem', fontSize: '0.7rem', lineHeight: 1 }}
                            >
                              ×
                            </button>
                          )}
                        </label>
                        {billeder.length > 0 && (
                          <div className="doc-thumbnails">
                            {billeder.map((bil, bilIdx) => (
                              <img
                                key={bil.id}
                                src={bil.dataUrl}
                                alt={`Billede ${bilIdx + 1}`}
                                className="doc-thumb"
                                onClick={() => setVisBillede({ katIdx, punktId: punkt.id, billedeIdx: bilIdx })}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="card">
            <h2>Tilføj eget punkt</h2>
            <div className="form-group">
              <label>Kategori</label>
              <select className="input" value={nytPunktKategori} onChange={e => setNytPunktKategori(Number(e.target.value))}>
                {aktivtProjekt.kategorier.map((k, i) => (
                  <option key={i} value={i}>{k.navn}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input"
                value={nytPunktTekst}
                onChange={e => setNytPunktTekst(e.target.value)}
                placeholder="Nyt tjekpunkt..."
                onKeyDown={e => e.key === 'Enter' && tilfoejPunkt()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={tilfoejPunkt}>Tilføj</button>
            </div>
          </div>

          <div className="results-card">
            <h2>Opsummering</h2>
            <table>
              <tbody>
                {Object.entries(getResultData()).map(([k, v]) => (
                  <tr key={k} style={k === 'Fremskridt' ? { fontWeight: 'bold' } : {}}>
                    <td><strong>{k}</strong></td>
                    <td style={{ textAlign: 'right' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ResultActions
              toolType="dokumentation"
              toolPath="dokumentation"
              title={`Dokumentation: ${aktivtProjekt.navn}`}
              inputs={getInputData()}
              results={getResultData()}
              materialList={null}
              notes={null}
            />
          </div>
        </>
      )}

      {/* Image viewer modal */}
      {visningsBillede && (
        <>
          <div className="modal-overlay" onClick={() => setVisBillede(null)} />
          <div className="doc-image-modal">
            <img src={visningsBillede.dataUrl} alt="Dokumentation" className="doc-image-full" />
            <div className="doc-image-modal-actions">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {new Date(visningsBillede.dato).toLocaleString('da-DK')}
              </span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => sletBillede(visBillede.katIdx, visBillede.punktId, visningsBillede.id)}
              >
                Slet billede
              </button>
              <button className="btn btn-sm" onClick={() => setVisBillede(null)}>Luk</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
