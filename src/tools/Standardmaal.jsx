import { useState } from 'react';
import { standardmaal } from '../data/standardmaal';

export default function Standardmaal() {
  const [soeg, setSoeg] = useState('');
  const [aabne, setAabne] = useState({});

  function toggleKategori(index) {
    setAabne(prev => ({ ...prev, [index]: !prev[index] }));
  }

  function filtrerData() {
    if (!soeg.trim()) return standardmaal;

    const term = soeg.toLowerCase().trim();
    return standardmaal
      .map(kat => ({
        ...kat,
        items: kat.items.filter(
          item =>
            item.navn.toLowerCase().includes(term) ||
            item.maal.toLowerCase().includes(term)
        ),
      }))
      .filter(kat => kat.items.length > 0);
  }

  const filtreret = filtrerData();

  return (
    <div className="tool-page">
      <h1>Standardmål</h1>
      <p>Opslagsværk med gængse mål for tømrermaterialer og byggeelementer.</p>

      <div className="card">
        <div className="form-group">
          <label>Søg i mål og materialer</label>
          <input
            type="text"
            className="input"
            value={soeg}
            onChange={e => setSoeg(e.target.value)}
            placeholder="F.eks. reglar, gips, spær..."
          />
        </div>
      </div>

      {filtreret.length === 0 && (
        <div className="card">
          <p>Ingen resultater for \“{soeg}\”. Prøv et andet søgeord.</p>
        </div>
      )}

      {filtreret.map((kat, index) => {
        const erAaben = soeg.trim() ? true : !!aabne[index];

        return (
          <div className="card" key={kat.kategori}>
            <div
              className="card-header"
              onClick={() => toggleKategori(index)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0 }}>{kat.kategori}</h2>
              <span style={{ fontSize: '1.2rem' }}>{erAaben ? '\▲' : '\▼'}</span>
            </div>

            {erAaben && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.75rem' }}>
                {kat.items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: i < kat.items.length - 1 ? '1px solid var(--border, #e0e0e0)' : 'none',
                    }}
                  >
                    <strong>{item.navn}:</strong> {item.maal}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
