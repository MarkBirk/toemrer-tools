import { useState, useEffect } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';

const DENSITIES = {
  'Fyrretræ': 500,
  'Egetræ': 700,
  'Gran': 450,
  'MDF': 750,
  'Krydsfiner': 600,
  'OSB': 620,
  'Gips': 850,
  'Beton': 2400,
  'Stål': 7850,
};

// Materials that use plate dimensions (width, height, thickness)
const PLATE_MATERIALS = ['MDF', 'Krydsfiner', 'OSB', 'Gips'];

// Beton can use volume directly
const BETON = 'Beton';

function getMaterialCategory(material) {
  if (PLATE_MATERIALS.includes(material)) return 'plade';
  if (material === BETON) return 'beton';
  return 'traelast'; // Fyrretræ, Egetræ, Gran, Stål
}

export default function VaegtBeregner() {
  const [material, setMaterial] = useState('Fyrretræ');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lengthVal, setLengthVal] = useState('');
  const [thickness, setThickness] = useState('');
  const [volumeM3, setVolumeM3] = useState('');
  const [betonMode, setBetonMode] = useState('dimensioner'); // 'dimensioner' or 'volumen'
  const [antal, setAntal] = useState('1');
  const [results, setResults] = useState(null);

  // Load shared data from URL on mount
  useEffect(() => {
    const shared = parseShareFromURL();
    if (shared && shared.inputs) {
      const inp = shared.inputs;
      if (inp.material) setMaterial(inp.material);
      if (inp.width) setWidth(inp.width);
      if (inp.height) setHeight(inp.height);
      if (inp.lengthVal) setLengthVal(inp.lengthVal);
      if (inp.thickness) setThickness(inp.thickness);
      if (inp.volumeM3) setVolumeM3(inp.volumeM3);
      if (inp.betonMode) setBetonMode(inp.betonMode);
      if (inp.antal) setAntal(inp.antal);
    }
  }, []);

  const category = getMaterialCategory(material);

  function beregn() {
    const density = DENSITIES[material];
    if (!density) return;

    const qty = parseInt(antal, 10) || 1;
    let volume = 0; // in m³

    if (category === 'beton' && betonMode === 'volumen') {
      // Direct volume input
      volume = parseFloat(volumeM3);
      if (!volume || volume <= 0) return;
    } else if (category === 'beton' && betonMode === 'dimensioner') {
      // Beton with dimensions: length x width x thickness (all mm)
      const w = parseFloat(width);
      const h = parseFloat(height);
      const t = parseFloat(thickness);
      if (!w || !h || !t || w <= 0 || h <= 0 || t <= 0) return;
      volume = (w / 1000) * (h / 1000) * (t / 1000);
    } else if (category === 'plade') {
      // Plates: width x height x thickness (all mm)
      const w = parseFloat(width);
      const h = parseFloat(height);
      const t = parseFloat(thickness);
      if (!w || !h || !t || w <= 0 || h <= 0 || t <= 0) return;
      volume = (w / 1000) * (h / 1000) * (t / 1000);
    } else {
      // Timber / steel: width x height x length (all mm)
      const w = parseFloat(width);
      const h = parseFloat(height);
      const l = parseFloat(lengthVal);
      if (!w || !h || !l || w <= 0 || h <= 0 || l <= 0) return;
      volume = (w / 1000) * (h / 1000) * (l / 1000);
    }

    const weightPerPiece = volume * density;
    const totalWeight = weightPerPiece * qty;

    setResults({
      volumeM3: volume,
      density,
      weightPerPiece,
      totalWeight,
      qty,
    });
  }

  function getInputs() {
    const inp = { material, antal };
    if (category === 'beton' && betonMode === 'volumen') {
      inp.betonMode = betonMode;
      inp.volumeM3 = volumeM3;
    } else if (category === 'beton' && betonMode === 'dimensioner') {
      inp.betonMode = betonMode;
      inp.width = width;
      inp.height = height;
      inp.thickness = thickness;
    } else if (category === 'plade') {
      inp.width = width;
      inp.height = height;
      inp.thickness = thickness;
    } else {
      inp.width = width;
      inp.height = height;
      inp.lengthVal = lengthVal;
    }
    return inp;
  }

  function getResultsForExport() {
    if (!results) return {};
    return {
      'Vægt pr. stk': `${results.weightPerPiece.toFixed(2)} kg`,
      'Antal': results.qty,
      'Total vægt': `${results.totalWeight.toFixed(2)} kg`,
      'Volumen pr. stk': `${results.volumeM3.toFixed(6)} m³`,
      'Densitet brugt': `${results.density} kg/m³`,
    };
  }

  function getInputsForExport() {
    const exp = { Materiale: material, Antal: antal };
    if (category === 'beton' && betonMode === 'volumen') {
      exp['Volumen'] = `${volumeM3} m³`;
    } else if (category === 'beton' && betonMode === 'dimensioner') {
      exp['Bredde'] = `${width} mm`;
      exp['Højde'] = `${height} mm`;
      exp['Tykkelse'] = `${thickness} mm`;
    } else if (category === 'plade') {
      exp['Bredde'] = `${width} mm`;
      exp['Højde'] = `${height} mm`;
      exp['Tykkelse'] = `${thickness} mm`;
    } else {
      exp['Bredde'] = `${width} mm`;
      exp['Højde'] = `${height} mm`;
      exp['Længde'] = `${lengthVal} mm`;
    }
    return exp;
  }

  return (
    <div className="tool-page">
      <h1>Vægtberegner</h1>
      <p>Beregn vægten af træ, plader, beton og stål ud fra dimensioner og materialetype.</p>

      <div className="card">
        <div className="form-group">
          <label>Materialetype</label>
          <select
            className="input"
            value={material}
            onChange={(e) => {
              setMaterial(e.target.value);
              setResults(null);
            }}
          >
            {Object.keys(DENSITIES).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Beton mode selector */}
        {category === 'beton' && (
          <div className="form-group">
            <label>Indtastningsmetode</label>
            <select
              className="input"
              value={betonMode}
              onChange={(e) => setBetonMode(e.target.value)}
            >
              <option value="dimensioner">Længde × Bredde × Tykkelse</option>
              <option value="volumen">Volumen (m³)</option>
            </select>
          </div>
        )}

        {/* Direct volume for beton */}
        {category === 'beton' && betonMode === 'volumen' && (
          <div className="form-group">
            <label>Volumen (m³)</label>
            <input
              type="number"
              className="input"
              value={volumeM3}
              onChange={(e) => setVolumeM3(e.target.value)}
              placeholder="F.eks. 0.5"
              min="0"
              step="0.001"
            />
          </div>
        )}

        {/* Dimension inputs for beton (dimensioner mode) and plates */}
        {((category === 'beton' && betonMode === 'dimensioner') || category === 'plade') && (
          <>
            <div className="form-group">
              <label>Bredde (mm)</label>
              <input
                type="number"
                className="input"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="F.eks. 1200"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Højde (mm)</label>
              <input
                type="number"
                className="input"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="F.eks. 2400"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Tykkelse (mm)</label>
              <input
                type="number"
                className="input"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                placeholder="F.eks. 12"
                min="0"
              />
            </div>
          </>
        )}

        {/* Dimension inputs for timber / steel */}
        {category === 'traelast' && (
          <>
            <div className="form-group">
              <label>Bredde (mm)</label>
              <input
                type="number"
                className="input"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="F.eks. 45"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Højde (mm)</label>
              <input
                type="number"
                className="input"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="F.eks. 195"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Længde (mm)</label>
              <input
                type="number"
                className="input"
                value={lengthVal}
                onChange={(e) => setLengthVal(e.target.value)}
                placeholder="F.eks. 4800"
                min="0"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Antal</label>
          <input
            type="number"
            className="input"
            value={antal}
            onChange={(e) => setAntal(e.target.value)}
            placeholder="1"
            min="1"
          />
        </div>

        <button className="btn btn-primary" onClick={beregn}>
          Beregn vægt
        </button>
      </div>

      {results && (
        <div className="results-card">
          <h2>Resultat</h2>
          <table>
            <tbody>
              <tr>
                <td><strong>Vægt pr. stk</strong></td>
                <td>{results.weightPerPiece.toFixed(2)} kg</td>
              </tr>
              <tr>
                <td><strong>Antal</strong></td>
                <td>{results.qty} stk</td>
              </tr>
              <tr>
                <td><strong>Total vægt</strong></td>
                <td>{results.totalWeight.toFixed(2)} kg</td>
              </tr>
              <tr>
                <td><strong>Volumen pr. stk</strong></td>
                <td>{results.volumeM3.toFixed(6)} m³</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Densitet brugt: {results.density} kg/m³ (gennemsnit, kan variere)
          </p>

          <ResultActions
            toolType="vaegt-beregner"
            toolPath="vaegt-beregner"
            title="Vægtberegning"
            inputs={getInputsForExport()}
            results={getResultsForExport()}
            materialList={null}
            notes={null}
          />
        </div>
      )}
    </div>
  );
}
