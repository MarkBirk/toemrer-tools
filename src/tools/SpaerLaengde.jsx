import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';

export default function SpaerLaengde() {
  const location = useLocation();
  const [span, setSpan] = useState('');
  const [inputMode, setInputMode] = useState('hoejde'); // 'hoejde' or 'haeldning'
  const [hoejde, setHoejde] = useState('');
  const [haeldning, setHaeldning] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const saved = location.state?.savedItem;
    if (saved?.inputs) {
      const inp = saved.inputs;
      const p = (v) => v ? v.replace(/[^\d.,]/g, '').replace(',', '.') : '';
      if (inp['Spænd']) setSpan(p(inp['Spænd']));
      if (inp['Beregningsmetode'] === 'Højde') {
        setInputMode('hoejde');
        if (inp['Højde']) setHoejde(p(inp['Højde']));
      } else if (inp['Beregningsmetode'] === 'Hældning') {
        setInputMode('haeldning');
        if (inp['Hældning']) setHaeldning(p(inp['Hældning']));
      }
      return;
    }
    const shared = parseShareFromURL();
    if (shared && shared.inputs) {
      const inp = shared.inputs;
      if (inp.span) setSpan(inp.span);
      if (inp.inputMode) setInputMode(inp.inputMode);
      if (inp.hoejde) setHoejde(inp.hoejde);
      if (inp.haeldning) setHaeldning(inp.haeldning);
    }
  }, []);

  function beregn() {
    const spanVal = parseFloat(span);
    if (!spanVal || spanVal <= 0) return;

    const halfSpan = spanVal / 2;
    let height;
    let pitchDeg;

    if (inputMode === 'hoejde') {
      height = parseFloat(hoejde);
      if (!height || height <= 0) return;
      pitchDeg = Math.atan(height / halfSpan) * (180 / Math.PI);
    } else {
      pitchDeg = parseFloat(haeldning);
      if (!pitchDeg || pitchDeg <= 0 || pitchDeg >= 90) return;
      const pitchRad = pitchDeg * (Math.PI / 180);
      height = halfSpan * Math.tan(pitchRad);
    }

    const rafterLength = Math.sqrt(halfSpan * halfSpan + height * height);

    setResults({
      spaerLaengdeMm: Math.round(rafterLength),
      spaerLaengdeM: (rafterLength / 1000).toFixed(3),
      kipHoejdeMm: Math.round(height),
      haeldningGrader: pitchDeg.toFixed(1),
    });
  }

  function getInputs() {
    const inp = {
      'Spænd': `${span} mm`,
      'Beregningsmetode': inputMode === 'hoejde' ? 'Højde' : 'Hældning',
    };
    if (inputMode === 'hoejde') inp['Højde'] = `${hoejde} mm`;
    else inp['Hældning'] = `${haeldning}°`;
    return inp;
  }

  function getResultsList() {
    if (!results) return [];
    return [
      { label: 'Spærlængde', value: `${results.spaerLaengdeMm} mm (${results.spaerLaengdeM} m)` },
      { label: 'Kiphøjde', value: `${results.kipHoejdeMm} mm` },
      { label: 'Hældning', value: `${results.haeldningGrader}°` },
    ];
  }

  return (
    <div className="tool-page">
      <h1>Spærlængde-beregner</h1>
      <p>Beregn spærlængde ud fra spænd og enten kiphøjde eller haldning (Pythagoras).</p>

      <div className="card">
        <div className="form-group">
          <label>Spænd (mm)</label>
          <input
            type="number"
            className="input"
            value={span}
            onChange={e => setSpan(e.target.value)}
            placeholder="F.eks. 8000"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Indtastningsmetode</label>
          <select
            className="input"
            value={inputMode}
            onChange={e => setInputMode(e.target.value)}
          >
            <option value="hoejde">Højde (kip)</option>
            <option value="haeldning">Hældning (grader)</option>
          </select>
        </div>

        {inputMode === 'hoejde' && (
          <div className="form-group">
            <label>Kiphøjde (mm)</label>
            <input
              type="number"
              className="input"
              value={hoejde}
              onChange={e => setHoejde(e.target.value)}
              placeholder="F.eks. 2000"
              min="0"
            />
          </div>
        )}

        {inputMode === 'haeldning' && (
          <div className="form-group">
            <label>Hældning (grader)</label>
            <input
              type="number"
              className="input"
              value={haeldning}
              onChange={e => setHaeldning(e.target.value)}
              placeholder="F.eks. 30"
              min="0.1"
              max="89.9"
              step="0.1"
            />
          </div>
        )}

        <button className="btn btn-primary" onClick={beregn}>
          Beregn
        </button>
      </div>

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

          <ResultActions
            toolType="spaer-laengde"
            toolPath="spaer-laengde"
            title="Spærlængde-beregning"
            inputs={getInputs()}
            results={getResultsList()}
            materialList={null}
            notes={null}
          />
        </div>
      )}
    </div>
  );
}
