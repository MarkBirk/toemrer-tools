import { useState, useEffect, useMemo } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';
import { getCalcDefaults } from '../utils/calcDefaults';

const TABS = [
  { key: 'terrasse', label: 'Terrasse' },
  { key: 'vaeg', label: 'Væg / Reglar' },
  { key: 'isolering', label: 'Isolering' },
];

function defaultTerrasse() {
  const d = getCalcDefaults().terrasse;
  return {
    length: '',
    width: '',
    boardWidth: String(d.boardWidth),
    boardGap: String(d.boardGap),
    joistSpacing: String(d.joistSpacing),
    waste: String(d.waste),
  };
}

function defaultVaeg() {
  const d = getCalcDefaults().vaeg;
  return {
    wallLength: '',
    wallHeight: String(d.wallHeight),
    studSpacing: String(d.studSpacing),
    platesPerSide: '1',
    plateWidth: String(d.plateWidth),
    plateHeight: String(d.plateHeight),
  };
}

function defaultIsolering() {
  const d = getCalcDefaults().isolering;
  return {
    area: '',
    thickness: '',
    packageCoverage: String(d.packageCoverage),
    waste: String(d.waste),
  };
}

export default function Materialeberegner() {
  const [tab, setTab] = useState('terrasse');

  // Terrasse state
  const [terrasse, setTerrasse] = useState(defaultTerrasse);
  const [terrasseResults, setTerrasseResults] = useState(null);

  // Vaeg state
  const [vaeg, setVaeg] = useState(defaultVaeg);
  const [vaegResults, setVaegResults] = useState(null);

  // Isolering state
  const [isolering, setIsolering] = useState(defaultIsolering);
  const [isoleringResults, setIsoleringResults] = useState(null);

  // Load shared data on mount
  useEffect(() => {
    const shared = parseShareFromURL();
    if (!shared || !shared.inputs) return;
    const inp = shared.inputs;

    if (inp.tab === 'terrasse' || inp.length !== undefined) {
      setTab('terrasse');
      setTerrasse(prev => ({ ...prev, ...inp }));
    } else if (inp.tab === 'vaeg' || inp.wallLength !== undefined) {
      setTab('vaeg');
      setVaeg(prev => ({ ...prev, ...inp }));
    } else if (inp.tab === 'isolering' || inp.area !== undefined) {
      setTab('isolering');
      setIsolering(prev => ({ ...prev, ...inp }));
    }
  }, []);

  // --- Terrasse calculation ---
  function beregnTerrasse() {
    const l = parseFloat(terrasse.length);
    const w = parseFloat(terrasse.width);
    const bw = parseFloat(terrasse.boardWidth);
    const bg = parseFloat(terrasse.boardGap);
    const js = parseFloat(terrasse.joistSpacing);
    const waste = parseFloat(terrasse.waste);

    if ([l, w, bw, bg, js, waste].some(isNaN) || l <= 0 || w <= 0) return;

    const totalArea = l * w;
    const boardPitchM = (bw + bg) / 1000; // mm -> m
    const boardsAcrossWidth = Math.ceil(w / boardPitchM);
    const boardCountRaw = boardsAcrossWidth;
    const boardCount = Math.ceil(boardCountRaw * (1 + waste / 100));

    const joistCount = Math.ceil((w * 1000) / js) + 1;

    const screws = boardCount * joistCount * 2;

    const materialList = [
      { name: 'Brædder', quantity: boardCount, unit: 'stk', length: `${l} m` },
      { name: 'Strøer', quantity: joistCount, unit: 'stk', length: `${l} m` },
      { name: 'Skruer', quantity: screws, unit: 'stk', length: '' },
    ];

    setTerrasseResults({
      totalArea: totalArea.toFixed(2),
      boardCount,
      joistCount,
      screws,
      materialList,
    });
  }

  // --- Vaeg calculation ---
  function beregnVaeg() {
    const wl = parseFloat(vaeg.wallLength);
    const wh = parseFloat(vaeg.wallHeight);
    const ss = parseFloat(vaeg.studSpacing);
    const pps = parseInt(vaeg.platesPerSide, 10);
    const pw = parseFloat(vaeg.plateWidth);
    const ph = parseFloat(vaeg.plateHeight);

    if ([wl, wh, ss, pps, pw, ph].some(isNaN) || wl <= 0 || wh <= 0) return;

    // Studs: vertical studs + top and bottom plate (2 extra lengths)
    const verticalStuds = Math.ceil((wl * 1000) / ss) + 1;
    const totalStuds = verticalStuds + 2; // +2 for top/bottom runner

    // Plates: wall area / plate area, both sides
    const wallArea = wl * wh;
    const plateArea = (pw / 1000) * (ph / 1000);
    const platesOneSide = Math.ceil(wallArea / plateArea);
    const totalPlates = platesOneSide * pps;

    // Screws: ~15 per m2 for gips (configurable via admin)
    const spm2 = getCalcDefaults().vaeg.screwsPerM2;
    const screws = Math.ceil(wallArea * pps * spm2);

    const materialList = [
      { name: 'Reglar', quantity: totalStuds, unit: 'stk', length: `${wh} m` },
      { name: 'Plader', quantity: totalPlates, unit: 'stk', length: `${pw}x${ph} mm` },
      { name: 'Skruer', quantity: screws, unit: 'stk', length: '' },
    ];

    setVaegResults({
      verticalStuds,
      totalStuds,
      platesOneSide,
      totalPlates,
      screws,
      wallArea: wallArea.toFixed(2),
      materialList,
    });
  }

  // --- Isolering calculation ---
  function beregnIsolering() {
    const a = parseFloat(isolering.area);
    const t = parseFloat(isolering.thickness);
    const pc = parseFloat(isolering.packageCoverage);
    const waste = parseFloat(isolering.waste);

    if ([a, t, pc, waste].some(isNaN) || a <= 0 || pc <= 0) return;

    const totalArea = a * (1 + waste / 100);
    const packages = Math.ceil(totalArea / pc);

    const materialList = [
      { name: 'Isolering pakker', quantity: packages, unit: 'pk', length: `${t} mm tykkelse` },
    ];

    setIsoleringResults({
      baseArea: a.toFixed(2),
      totalArea: totalArea.toFixed(2),
      packages,
      thickness: t,
      materialList,
    });
  }

  // Current results for ResultActions
  const currentResults = useMemo(() => {
    if (tab === 'terrasse') return terrasseResults;
    if (tab === 'vaeg') return vaegResults;
    if (tab === 'isolering') return isoleringResults;
    return null;
  }, [tab, terrasseResults, vaegResults, isoleringResults]);

  const currentInputs = useMemo(() => {
    if (tab === 'terrasse') return { tab: 'terrasse', ...terrasse };
    if (tab === 'vaeg') return { tab: 'vaeg', ...vaeg };
    if (tab === 'isolering') return { tab: 'isolering', ...isolering };
    return {};
  }, [tab, terrasse, vaeg, isolering]);

  const currentMaterialList = currentResults?.materialList || null;

  // Helper for controlled inputs
  function terrasseField(key, label, placeholder, suffix) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="input-with-suffix">
          <input
            type="number"
            className="input"
            value={terrasse[key]}
            onChange={e => setTerrasse(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            inputMode="decimal"
          />
          {suffix && <span className="input-suffix">{suffix}</span>}
        </div>
      </div>
    );
  }

  function vaegField(key, label, placeholder, suffix, type = 'number') {
    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="input-with-suffix">
          {type === 'select' ? (
            <select
              className="input"
              value={vaeg[key]}
              onChange={e => setVaeg(prev => ({ ...prev, [key]: e.target.value }))}
            >
              <option value="1">1 side</option>
              <option value="2">2 sider</option>
            </select>
          ) : (
            <input
              type="number"
              className="input"
              value={vaeg[key]}
              onChange={e => setVaeg(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              inputMode="decimal"
            />
          )}
          {suffix && <span className="input-suffix">{suffix}</span>}
        </div>
      </div>
    );
  }

  function isoleringField(key, label, placeholder, suffix) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="input-with-suffix">
          <input
            type="number"
            className="input"
            value={isolering[key]}
            onChange={e => setIsolering(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            inputMode="decimal"
          />
          {suffix && <span className="input-suffix">{suffix}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="tool-page">
      <h1>Materialeberegner</h1>
      <p className="tool-description">
        Beregn materialeforbrug til terrasse, vægge og isolering.
      </p>

      {/* Tab buttons */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TERRASSE TAB ===== */}
      {tab === 'terrasse' && (
        <div className="card">
          <h2>Terrasse</h2>
          {terrasseField('length', 'Længde', 'F.eks. 4.8', 'm')}
          {terrasseField('width', 'Bredde', 'F.eks. 3.6', 'm')}
          {terrasseField('boardWidth', 'Bræddebredde', '145', 'mm')}
          {terrasseField('boardGap', 'Mellemrum', '5', 'mm')}
          {terrasseField('joistSpacing', 'Strøafstand (c/c)', '600', 'mm')}
          {terrasseField('waste', 'Spild', '10', '%')}
          <button className="btn btn-primary" onClick={beregnTerrasse}>
            Beregn
          </button>

          {terrasseResults && (
            <div className="results-card">
              <h3>Resultat</h3>
              <div className="result-row">
                <span>Samlet areal</span>
                <strong>{terrasseResults.totalArea} m²</strong>
              </div>
              <div className="result-row">
                <span>Antal brædder</span>
                <strong>{terrasseResults.boardCount} stk</strong>
              </div>
              <div className="result-row">
                <span>Antal strøer</span>
                <strong>{terrasseResults.joistCount} stk</strong>
              </div>
              <div className="result-row">
                <span>Skruer</span>
                <strong>{terrasseResults.screws} stk</strong>
              </div>

              <h4>Materialeliste</h4>
              <table className="material-table">
                <thead>
                  <tr>
                    <th>Materiale</th>
                    <th>Antal</th>
                    <th>Enhed</th>
                    <th>Mål</th>
                  </tr>
                </thead>
                <tbody>
                  {terrasseResults.materialList.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.quantity}</td>
                      <td>{m.unit}</td>
                      <td>{m.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== VÆG TAB ===== */}
      {tab === 'vaeg' && (
        <div className="card">
          <h2>Væg / Reglar</h2>
          {vaegField('wallLength', 'Væglængde', 'F.eks. 5.0', 'm')}
          {vaegField('wallHeight', 'Væghøjde', '2.4', 'm')}
          {vaegField('studSpacing', 'Regelafstand (c/c)', '600', 'mm')}
          {vaegField('platesPerSide', 'Plader pr. side', '', '', 'select')}
          {vaegField('plateWidth', 'Pladebredde', '1200', 'mm')}
          {vaegField('plateHeight', 'Pladehøjde', '2400', 'mm')}
          <button className="btn btn-primary" onClick={beregnVaeg}>
            Beregn
          </button>

          {vaegResults && (
            <div className="results-card">
              <h3>Resultat</h3>
              <div className="result-row">
                <span>Vægareal</span>
                <strong>{vaegResults.wallArea} m²</strong>
              </div>
              <div className="result-row">
                <span>Lodrette reglar</span>
                <strong>{vaegResults.verticalStuds} stk</strong>
              </div>
              <div className="result-row">
                <span>Reglar i alt (inkl. over-/underrem)</span>
                <strong>{vaegResults.totalStuds} stk</strong>
              </div>
              <div className="result-row">
                <span>Plader pr. side</span>
                <strong>{vaegResults.platesOneSide} stk</strong>
              </div>
              <div className="result-row">
                <span>Plader i alt</span>
                <strong>{vaegResults.totalPlates} stk</strong>
              </div>
              <div className="result-row">
                <span>Skruer (gips)</span>
                <strong>{vaegResults.screws} stk</strong>
              </div>

              <h4>Materialeliste</h4>
              <table className="material-table">
                <thead>
                  <tr>
                    <th>Materiale</th>
                    <th>Antal</th>
                    <th>Enhed</th>
                    <th>Mål</th>
                  </tr>
                </thead>
                <tbody>
                  {vaegResults.materialList.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.quantity}</td>
                      <td>{m.unit}</td>
                      <td>{m.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== ISOLERING TAB ===== */}
      {tab === 'isolering' && (
        <div className="card">
          <h2>Isolering</h2>
          {isoleringField('area', 'Areal', 'F.eks. 50', 'm²')}
          {isoleringField('thickness', 'Tykkelse', 'F.eks. 145', 'mm')}
          {isoleringField('packageCoverage', 'Pakke dækning', '3.42', 'm²/pk')}
          {isoleringField('waste', 'Spild', '5', '%')}
          <button className="btn btn-primary" onClick={beregnIsolering}>
            Beregn
          </button>

          {isoleringResults && (
            <div className="results-card">
              <h3>Resultat</h3>
              <div className="result-row">
                <span>Grundareal</span>
                <strong>{isoleringResults.baseArea} m²</strong>
              </div>
              <div className="result-row">
                <span>Areal inkl. spild</span>
                <strong>{isoleringResults.totalArea} m²</strong>
              </div>
              <div className="result-row">
                <span>Tykkelse</span>
                <strong>{isoleringResults.thickness} mm</strong>
              </div>
              <div className="result-row">
                <span>Antal pakker</span>
                <strong>{isoleringResults.packages} pk</strong>
              </div>

              <h4>Materialeliste</h4>
              <table className="material-table">
                <thead>
                  <tr>
                    <th>Materiale</th>
                    <th>Antal</th>
                    <th>Enhed</th>
                    <th>Mål</th>
                  </tr>
                </thead>
                <tbody>
                  {isoleringResults.materialList.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.quantity}</td>
                      <td>{m.unit}</td>
                      <td>{m.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ResultActions */}
      {currentResults && (
        <ResultActions
          toolType="materialeberegner"
          toolPath="/materialeberegner"
          title={`Materialeberegner - ${TABS.find(t => t.key === tab)?.label}`}
          inputs={currentInputs}
          results={currentResults}
          materialList={currentMaterialList}
          notes={null}
          onSaved={null}
        />
      )}
    </div>
  );
}
