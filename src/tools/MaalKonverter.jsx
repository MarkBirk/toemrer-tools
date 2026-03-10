import { useState, useEffect } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';

const CONVERSION_TYPES = [
  { id: 'tommer-mm', label: 'Tommer \↔ mm', unitA: 'tommer', unitB: 'mm', factor: 25.4 },
  { id: 'cm-mm', label: 'cm \↔ mm', unitA: 'cm', unitB: 'mm', factor: 10 },
  { id: 'm-cm', label: 'm \↔ cm', unitA: 'm', unitB: 'cm', factor: 100 },
  { id: 'm-mm', label: 'm \↔ mm', unitA: 'm', unitB: 'mm', factor: 1000 },
  { id: 'm2-plader', label: 'm² → antal plader', unitA: 'm²', unitB: 'plader', factor: null },
];

export default function MaalKonverter() {
  const [convType, setConvType] = useState('tommer-mm');
  const [valueA, setValueA] = useState('');
  const [valueB, setValueB] = useState('');
  const [plateWidth, setPlateWidth] = useState('');
  const [plateHeight, setPlateHeight] = useState('');
  const [results, setResults] = useState(null);

  const conv = CONVERSION_TYPES.find(c => c.id === convType);
  const isPlader = convType === 'm2-plader';

  // Check for share data on mount
  useEffect(() => {
    const shared = parseShareFromURL();
    if (shared && shared.inputs) {
      const inp = shared.inputs;
      if (inp.convType) setConvType(inp.convType);
      if (inp.valueA) setValueA(inp.valueA);
      if (inp.valueB) setValueB(inp.valueB);
      if (inp.plateWidth) setPlateWidth(inp.plateWidth);
      if (inp.plateHeight) setPlateHeight(inp.plateHeight);
    }
  }, []);

  // Live conversion as user types
  useEffect(() => {
    if (isPlader) {
      computePlader();
    } else {
      convertAtoB();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueA, valueB, convType, plateWidth, plateHeight]);

  function convertAtoB() {
    if (!conv || isPlader) return;
    const numA = parseFloat(valueA);
    if (!isNaN(numA) && valueA !== '') {
      const converted = numA * conv.factor;
      setResults({
        direction: `${conv.unitA} → ${conv.unitB}`,
        inputValue: numA,
        inputUnit: conv.unitA,
        resultValue: converted,
        resultUnit: conv.unitB,
        text: `${numA} ${conv.unitA} = ${formatNumber(converted)} ${conv.unitB}`,
      });
    } else {
      setResults(null);
    }
  }

  function convertBtoA() {
    if (!conv || isPlader) return;
    const numB = parseFloat(valueB);
    if (!isNaN(numB) && valueB !== '') {
      const converted = numB / conv.factor;
      setValueA(String(converted));
      setResults({
        direction: `${conv.unitB} → ${conv.unitA}`,
        inputValue: numB,
        inputUnit: conv.unitB,
        resultValue: converted,
        resultUnit: conv.unitA,
        text: `${numB} ${conv.unitB} = ${formatNumber(converted)} ${conv.unitA}`,
      });
    }
  }

  function computePlader() {
    const area = parseFloat(valueA);
    const w = parseFloat(plateWidth);
    const h = parseFloat(plateHeight);
    if (!isNaN(area) && !isNaN(w) && !isNaN(h) && w > 0 && h > 0 && area > 0) {
      const plateAreaM2 = (w * h) / 1_000_000;
      const antal = Math.ceil(area / plateAreaM2);
      setResults({
        direction: 'm² → antal plader',
        inputValue: area,
        inputUnit: 'm²',
        resultValue: antal,
        resultUnit: 'plader',
        plateAreaM2: plateAreaM2,
        text: `${area} m² \÷ (${w} × ${h} mm) = ${antal} plader`,
        details: `Pladeareal: ${formatNumber(plateAreaM2)} m² pr. plade`,
      });
    } else {
      setResults(null);
    }
  }

  function handleSwap() {
    if (isPlader) return;
    const tmp = valueA;
    setValueA(valueB);
    setValueB(tmp);
  }

  function handleBeregn() {
    if (isPlader) {
      computePlader();
    } else {
      convertAtoB();
    }
  }

  function handleValueAChange(val) {
    setValueA(val);
    if (!isPlader && conv) {
      const num = parseFloat(val);
      if (!isNaN(num) && val !== '') {
        setValueB(String(formatNumber(num * conv.factor)));
      } else {
        setValueB('');
      }
    }
  }

  function handleValueBChange(val) {
    setValueB(val);
    if (!isPlader && conv) {
      const num = parseFloat(val);
      if (!isNaN(num) && val !== '') {
        setValueA(String(formatNumber(num / conv.factor)));
      } else {
        setValueA('');
      }
    }
  }

  function formatNumber(n) {
    if (Number.isInteger(n)) return n;
    return parseFloat(n.toFixed(6));
  }

  const inputData = isPlader
    ? {
        'Type': 'm² → antal plader',
        'Areal': `${valueA} m²`,
        'Pladebredde': `${plateWidth} mm`,
        'Pladehøjde': `${plateHeight} mm`,
      }
    : {
        'Type': conv?.label || convType,
        [conv?.unitA || 'Værdi']: valueA,
        [conv?.unitB || 'Resultat']: valueB,
      };

  const resultData = results
    ? {
        'Konvertering': results.text,
        ...(results.details ? { 'Detaljer': results.details } : {}),
      }
    : null;

  return (
    <div className="tool-page">
      <h1>Målkonverter</h1>
      <p>Konvert\ér mellem de mest brugte måleenheder i tømrerarbejde.</p>

      <div className="card">
        <div className="form-group">
          <label>Konverteringstype</label>
          <select
            className="input"
            value={convType}
            onChange={e => {
              setConvType(e.target.value);
              setValueA('');
              setValueB('');
              setResults(null);
            }}
          >
            {CONVERSION_TYPES.map(ct => (
              <option key={ct.id} value={ct.id}>{ct.label}</option>
            ))}
          </select>
        </div>

        {!isPlader && (
          <div className="conversion-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>{conv.unitA}</label>
              <input
                type="number"
                className="input"
                value={valueA}
                onChange={e => handleValueAChange(e.target.value)}
                placeholder={`Angiv ${conv.unitA}`}
              />
            </div>

            <button
              className="btn btn-sm"
              onClick={handleSwap}
              title="Byt retning"
              style={{ marginBottom: '0.5rem', fontSize: '1.2rem', padding: '0.4rem 0.6rem' }}
            >
              &#8596;
            </button>

            <div className="form-group" style={{ flex: 1 }}>
              <label>{conv.unitB}</label>
              <input
                type="number"
                className="input"
                value={valueB}
                onChange={e => handleValueBChange(e.target.value)}
                placeholder={`Angiv ${conv.unitB}`}
              />
            </div>
          </div>
        )}

        {isPlader && (
          <>
            <div className="form-group">
              <label>Areal (m&sup2;)</label>
              <input
                type="number"
                className="input"
                value={valueA}
                onChange={e => setValueA(e.target.value)}
                placeholder="Angiv areal i m²"
              />
            </div>

            <div className="conversion-row" style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Pladebredde (mm)</label>
                <input
                  type="number"
                  className="input"
                  value={plateWidth}
                  onChange={e => setPlateWidth(e.target.value)}
                  placeholder="Bredde i mm"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Pladehøjde (mm)</label>
                <input
                  type="number"
                  className="input"
                  value={plateHeight}
                  onChange={e => setPlateHeight(e.target.value)}
                  placeholder="Højde i mm"
                />
              </div>
            </div>
          </>
        )}

        <button className="btn btn-primary" onClick={handleBeregn}>
          Beregn
        </button>
      </div>

      {results && (
        <div className="results-card">
          <h2>Resultat</h2>
          <div className="result-main" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
            {results.text}
          </div>
          {results.details && (
            <p className="result-detail" style={{ color: '#666' }}>{results.details}</p>
          )}

          <ResultActions
            toolType="maal-konverter"
            toolPath="maal-konverter"
            title="Målkonvertering"
            inputs={inputData}
            results={resultData}
            materialList={null}
            notes=""
          />
        </div>
      )}
    </div>
  );
}
