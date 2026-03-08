import { useState, useEffect } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';

const UNITS = [
  { key: 'mm', label: 'mm' },
  { key: 'm', label: 'm' },
];

export default function Taghaeldning() {
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [unit, setUnit] = useState('mm');
  const [results, setResults] = useState(null);

  // Load shared data on mount
  useEffect(() => {
    const shared = parseShareFromURL();
    if (!shared || !shared.inputs) return;
    const inp = shared.inputs;
    if (inp.height !== undefined) setHeight(String(inp.height));
    if (inp.length !== undefined) setLength(String(inp.length));
    if (inp.unit) setUnit(inp.unit);
  }, []);

  function beregn() {
    let h = parseFloat(height);
    let l = parseFloat(length);

    if (isNaN(h) || isNaN(l) || h <= 0 || l <= 0) return;

    // Convert to same unit (both in whatever unit is selected -- ratio is unitless)
    const degrees = Math.atan(h / l) * (180 / Math.PI);
    const percent = (h / l) * 100;
    const ratioX = l / h;

    setResults({
      degrees: degrees.toFixed(2),
      percent: percent.toFixed(1),
      ratioX: ratioX.toFixed(2),
      heightVal: h,
      lengthVal: l,
      unit,
    });
  }

  const inputs = { height, length, unit };

  return (
    <div className="tool-page">
      <h1>Taghældningsberegner</h1>
      <p className="tool-description">
        Beregn taghældning i grader, procent og forholdstal ud fra højdeforskel og vandret længde.
      </p>

      <div className="card">
        <div className="form-group">
          <label>Enhed</label>
          <div className="unit-toggle">
            {UNITS.map(u => (
              <button
                key={u.key}
                className={`tab-btn ${unit === u.key ? 'active' : ''}`}
                onClick={() => setUnit(u.key)}
                type="button"
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Højdeforskel (stigning)</label>
          <div className="input-with-suffix">
            <input
              type="number"
              className="input"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="F.eks. 1200"
              inputMode="decimal"
            />
            <span className="input-suffix">{unit}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Vandret længde</label>
          <div className="input-with-suffix">
            <input
              type="number"
              className="input"
              value={length}
              onChange={e => setLength(e.target.value)}
              placeholder="F.eks. 4000"
              inputMode="decimal"
            />
            <span className="input-suffix">{unit}</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={beregn}>
          Beregn
        </button>

        {results && (
          <div className="results-card">
            <h3>Resultat</h3>
            <div className="result-row result-highlight">
              <span>Hældning i grader</span>
              <strong>{results.degrees}°</strong>
            </div>
            <div className="result-row result-highlight">
              <span>Hældning i procent</span>
              <strong>{results.percent} %</strong>
            </div>
            <div className="result-row result-highlight">
              <span>Forhold</span>
              <strong>1:{results.ratioX}</strong>
            </div>
            <div className="result-row">
              <span>Højdeforskel</span>
              <strong>{results.heightVal} {results.unit}</strong>
            </div>
            <div className="result-row">
              <span>Vandret længde</span>
              <strong>{results.lengthVal} {results.unit}</strong>
            </div>
          </div>
        )}
      </div>

      {results && (
        <ResultActions
          toolType="taghaeldning"
          toolPath="/taghaeldning"
          title="Taghældningsberegner"
          inputs={inputs}
          results={results}
          materialList={null}
          notes={null}
          onSaved={null}
        />
      )}
    </div>
  );
}
