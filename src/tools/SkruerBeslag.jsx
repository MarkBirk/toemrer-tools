import { useState, useEffect } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';

export default function SkruerBeslag() {
  const [activeTab, setActiveTab] = useState('terrasse');

  // Terrasse inputs
  const [terrasseArea, setTerrasseArea] = useState('');
  const [boardWidth, setBoardWidth] = useState('145');
  const [joistSpacing, setJoistSpacing] = useState('600');
  const [screwsPerCrossing, setScrewsPerCrossing] = useState('2');

  // Gips inputs
  const [gipsArea, setGipsArea] = useState('');
  const [screwsPerM2, setScrewsPerM2] = useState('15');
  const [layers, setLayers] = useState('1');

  const [results, setResults] = useState(null);
  const [materialList, setMaterialList] = useState(null);

  useEffect(() => {
    const shared = parseShareFromURL();
    if (shared && shared.inputs) {
      const inp = shared.inputs;
      if (inp.activeTab) setActiveTab(inp.activeTab);
      if (inp.terrasseArea) setTerrasseArea(inp.terrasseArea);
      if (inp.boardWidth) setBoardWidth(inp.boardWidth);
      if (inp.joistSpacing) setJoistSpacing(inp.joistSpacing);
      if (inp.screwsPerCrossing) setScrewsPerCrossing(inp.screwsPerCrossing);
      if (inp.gipsArea) setGipsArea(inp.gipsArea);
      if (inp.screwsPerM2) setScrewsPerM2(inp.screwsPerM2);
      if (inp.layers) setLayers(inp.layers);
    }
  }, []);

  function beregnTerrasse() {
    const area = parseFloat(terrasseArea);
    const bw = parseFloat(boardWidth);
    const js = parseFloat(joistSpacing);
    const spc = parseFloat(screwsPerCrossing);

    if (!area || area <= 0 || !bw || bw <= 0 || !js || js <= 0 || !spc || spc <= 0) return;

    const boardsPerMWidth = 1000 / (bw + 5);
    const joistCrossingsPerMLength = 1000 / js;
    const totalScrews = Math.ceil(boardsPerMWidth * joistCrossingsPerMLength * spc * area);

    setResults([
      { label: 'Areal', value: `${area} m²` },
      { label: 'Bræddebredde', value: `${bw} mm` },
      { label: 'Bjælkeafstand', value: `${js} mm` },
      { label: 'Skruer pr. krydsning', value: `${spc}` },
      { label: 'Skruer i alt (estimat)', value: `${totalScrews} stk.` },
    ]);
    setMaterialList([
      { name: 'Skruer (terrasseskruer)', count: totalScrews, unit: 'stk.' },
    ]);
  }

  function beregnGips() {
    const area = parseFloat(gipsArea);
    const spm2 = parseFloat(screwsPerM2);
    const l = parseInt(layers, 10);

    if (!area || area <= 0 || !spm2 || spm2 <= 0 || !l || l < 1) return;

    const totalScrews = Math.ceil(area * spm2 * l);

    setResults([
      { label: 'Vægareal', value: `${area} m²` },
      { label: 'Skruer pr. m²', value: `${spm2}` },
      { label: 'Antal lag', value: `${l}` },
      { label: 'Gipsskruer i alt', value: `${totalScrews} stk.` },
    ]);
    setMaterialList([
      { name: 'Gipsskruer', count: totalScrews, unit: 'stk.' },
    ]);
  }

  function beregn() {
    setResults(null);
    setMaterialList(null);
    if (activeTab === 'terrasse') {
      beregnTerrasse();
    } else {
      beregnGips();
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setResults(null);
    setMaterialList(null);
  }

  function getInputs() {
    if (activeTab === 'terrasse') {
      return { activeTab, terrasseArea, boardWidth, joistSpacing, screwsPerCrossing };
    }
    return { activeTab, gipsArea, screwsPerM2, layers };
  }

  return (
    <div className="tool-page">
      <h1>Skrue- og beslagsberegner</h1>
      <p>Beregn antal skruer til terrasse eller gipsvægge.</p>

      <div className="card">
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'terrasse' ? 'active' : ''}`}
            onClick={() => switchTab('terrasse')}
          >
            Terrasse
          </button>
          <button
            className={`tab-btn ${activeTab === 'gips' ? 'active' : ''}`}
            onClick={() => switchTab('gips')}
          >
            Gips
          </button>
        </div>

        {activeTab === 'terrasse' && (
          <>
            <div className="form-group">
              <label>Areal (m²)</label>
              <input
                type="number"
                className="input"
                value={terrasseArea}
                onChange={e => setTerrasseArea(e.target.value)}
                placeholder="F.eks. 25"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Bræddebredde (mm)</label>
              <input
                type="number"
                className="input"
                value={boardWidth}
                onChange={e => setBoardWidth(e.target.value)}
                placeholder="145"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Bjælkeafstand (mm)</label>
              <input
                type="number"
                className="input"
                value={joistSpacing}
                onChange={e => setJoistSpacing(e.target.value)}
                placeholder="600"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Skruer pr. krydsning</label>
              <input
                type="number"
                className="input"
                value={screwsPerCrossing}
                onChange={e => setScrewsPerCrossing(e.target.value)}
                placeholder="2"
                min="1"
              />
            </div>
          </>
        )}

        {activeTab === 'gips' && (
          <>
            <div className="form-group">
              <label>Vægareal (m²)</label>
              <input
                type="number"
                className="input"
                value={gipsArea}
                onChange={e => setGipsArea(e.target.value)}
                placeholder="F.eks. 40"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Skruer pr. m²</label>
              <input
                type="number"
                className="input"
                value={screwsPerM2}
                onChange={e => setScrewsPerM2(e.target.value)}
                placeholder="15"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Antal lag</label>
              <select
                className="input"
                value={layers}
                onChange={e => setLayers(e.target.value)}
              >
                <option value="1">1 lag</option>
                <option value="2">2 lag</option>
              </select>
            </div>
          </>
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
              {results.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.label}</strong></td>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {materialList && materialList.length > 0 && (
            <>
              <h3>Materialeliste</h3>
              <table>
                <thead>
                  <tr>
                    <th>Materiale</th>
                    <th>Antal</th>
                  </tr>
                </thead>
                <tbody>
                  {materialList.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.count} {m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <ResultActions
            toolType="skruer-beslag"
            toolPath="skruer-beslag"
            title={activeTab === 'terrasse' ? 'Skrueberegning - Terrasse' : 'Skrueberegning - Gips'}
            inputs={getInputs()}
            results={results}
            materialList={materialList}
            notes={null}
          />
        </div>
      )}
    </div>
  );
}
