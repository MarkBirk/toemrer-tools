import { useState } from 'react';
import { byggeregler, reglerDisclaimer } from '../data/byggeregler';

export default function ByggeRegler() {
  const [soegning, setSoegning] = useState('');

  const soegTekst = soegning.trim().toLowerCase();

  const filtreret = soegTekst
    ? byggeregler
        .map(kat => ({
          ...kat,
          regler: kat.regler.filter(
            r =>
              r.titel.toLowerCase().includes(soegTekst) ||
              r.tekst.toLowerCase().includes(soegTekst)
          ),
        }))
        .filter(kat => kat.regler.length > 0)
    : byggeregler;

  const totalRegler = filtreret.reduce((sum, kat) => sum + kat.regler.length, 0);

  return (
    <div className="tool-page">
      <h1>Byggeregler-opslagsbog</h1>
      <p>Hurtig oversigt over de vigtigste danske byggeregler og tommelfingerregler for tømrere og bygherrer.</p>

      <div className="card">
        <div className="form-group">
          <label>Søg i regler</label>
          <input
            type="text"
            className="input"
            value={soegning}
            onChange={e => setSoegning(e.target.value)}
            placeholder="F.eks. skel, brand, isolering..."
          />
        </div>
        {soegTekst && (
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
            Viser {totalRegler} regel{totalRegler !== 1 ? 'er' : ''} i {filtreret.length} kategori{filtreret.length !== 1 ? 'er' : ''}
          </p>
        )}
      </div>

      {filtreret.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          <p>Ingen regler matcher din søgning.</p>
        </div>
      )}

      {filtreret.map((kat, ki) => (
        <div className="card" key={ki}>
          <h2>{kat.kategori}</h2>
          {kat.regler.map((regel, ri) => (
            <div key={ri} style={{ marginBottom: ri < kat.regler.length - 1 ? '12px' : 0 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{regel.titel}</div>
              <div style={{ color: '#444', lineHeight: '1.5' }}>{regel.tekst}</div>
            </div>
          ))}
        </div>
      ))}

      <div
        className="card"
        style={{
          background: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          color: '#856404',
        }}
      >
        <strong>Bemærk:</strong> {reglerDisclaimer}
      </div>
    </div>
  );
}
