import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultActions from '../components/ResultActions';
import AffiliateLinks from '../components/AffiliateLinks';
import { parseShareFromURL } from '../utils/shareLink';
import { addToMaterialList } from '../utils/storage';
import { saveData, STORAGE_KEYS, getSavedMaterialLists, saveMaterialList, deleteSavedMaterialList } from '../services/storage';

const ENHEDER = ['stk', 'm', 'm²', 'm³', 'kg', 'pakke', 'rulle'];

function formatKr(n) {
  return n.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MaterialelisteGenerator() {
  const location = useLocation();
  const [list, setList] = useState([]);
  const [navn, setNavn] = useState('');
  const [antal, setAntal] = useState('');
  const [enhed, setEnhed] = useState('stk');
  const [enhedspris, setEnhedspris] = useState('');
  const [noter, setNoter] = useState('');
  const [msg, setMsg] = useState('');
  const [savedLists, setSavedLists] = useState([]);
  const [listeName, setListeName] = useState('');
  const [activeListId, setActiveListId] = useState(null);

  useEffect(() => {
    // Load from saved item (from Gemte beregninger)
    const saved = location.state?.savedItem;
    if (saved?.inputs?.list) {
      setList(saved.inputs.list);
      return;
    }
    const shared = parseShareFromURL();
    if (shared && shared.inputs && shared.inputs.list) {
      setList(shared.inputs.list);
    }
  }, []);

  useEffect(() => {
    setSavedLists(getSavedMaterialLists());
  }, []);

  // Auto-save draft to localStorage for cross-tool import
  useEffect(() => {
    const grandTotal = list.reduce((sum, item) => sum + (item.antal * (item.enhedspris || 0)), 0);
    saveData(STORAGE_KEYS.MATERIALELISTE_DRAFT, {
      list,
      grandTotal,
      updatedAt: new Date().toISOString(),
    });
  }, [list]);

  function tilfoejPost() {
    if (!navn.trim()) return;
    const antalVal = parseFloat(antal);
    if (!antalVal || antalVal <= 0) return;
    const prisVal = parseFloat(enhedspris) || 0;

    const nyPost = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      navn: navn.trim(),
      antal: antalVal,
      enhed,
      enhedspris: prisVal,
      noter: noter.trim(),
    };

    setList(prev => [...prev, nyPost]);
    setNavn('');
    setAntal('');
    setEnhedspris('');
    setEnhed('stk');
    setNoter('');
  }

  function fjernPost(id) {
    setList(prev => prev.filter(item => item.id !== id));
  }

  function flytOp(index) {
    if (index === 0) return;
    setList(prev => {
      const ny = [...prev];
      [ny[index - 1], ny[index]] = [ny[index], ny[index - 1]];
      return ny;
    });
  }

  function flytNed(index) {
    if (index >= list.length - 1) return;
    setList(prev => {
      const ny = [...prev];
      [ny[index], ny[index + 1]] = [ny[index + 1], ny[index]];
      return ny;
    });
  }

  function handleSaveList() {
    if (!listeName.trim()) {
      setMsg('Angiv et navn til listen');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    if (list.length === 0) {
      setMsg('Listen er tom — tilføj poster først');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    const gt = grandTotal();
    saveMaterialList(listeName.trim(), list, gt);
    setSavedLists(getSavedMaterialLists());
    setMsg(`Listen "${listeName.trim()}" er gemt!`);
    setListeName('');
    setTimeout(() => setMsg(''), 2000);
  }

  function handleLoadList(savedList) {
    setList(savedList.list);
    setActiveListId(savedList.id);
    setMsg(`Indlæst: ${savedList.name}`);
    setTimeout(() => setMsg(''), 2000);
  }

  function handleDeleteList(id, name) {
    if (!confirm(`Slet listen "${name}"?`)) return;
    deleteSavedMaterialList(id);
    setSavedLists(getSavedMaterialLists());
    if (activeListId === id) setActiveListId(null);
    setMsg('Listen er slettet');
    setTimeout(() => setMsg(''), 2000);
  }

  function tilfoejTilSamletListe() {
    if (list.length === 0) {
      setMsg('Ingen poster at tilføje');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    const materialer = list.map(item => ({
      navn: item.navn,
      antal: item.antal,
      enhed: item.enhed,
      noter: item.noter,
    }));
    addToMaterialList(materialer, 'Materialeliste-generator');
    setMsg('Tilføjet til samlet materialeliste!');
    setTimeout(() => setMsg(''), 2000);
  }

  function totalEnheder() {
    return list.reduce((sum, item) => sum + item.antal, 0);
  }

  function grandTotal() {
    return list.reduce((sum, item) => sum + (item.antal * (item.enhedspris || 0)), 0);
  }

  function getInputs() {
    return { list };
  }

  function getResults() {
    const res = [
      { label: 'Antal poster', value: list.length },
      { label: 'Total enheder', value: totalEnheder() },
    ];
    const gt = grandTotal();
    if (gt > 0) {
      res.push({ label: 'Samlet pris', value: `${formatKr(gt)} kr.` });
    }
    return res;
  }

  function getMaterialList() {
    return list.map(item => ({
      navn: item.navn,
      antal: item.antal,
      enhed: item.enhed,
      enhedspris: item.enhedspris || 0,
      totalpris: item.antal * (item.enhedspris || 0),
      noter: item.noter,
    }));
  }

  const harPriser = list.some(item => item.enhedspris > 0);

  return (
    <div className="tool-page">
      <h1>Materialeliste-generator</h1>
      <p>Opret en materialeliste ved at tilføje poster én ad gangen.</p>

      <div className="card">
        <h2>Tilføj post</h2>

        <div className="form-group">
          <label>Navn</label>
          <input
            type="text"
            className="input"
            value={navn}
            onChange={e => setNavn(e.target.value)}
            placeholder="F.eks. Reglar 45x95"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Antal</label>
            <input
              type="number"
              className="input"
              value={antal}
              onChange={e => setAntal(e.target.value)}
              placeholder="F.eks. 24"
              min="0"
              step="any"
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Enhed</label>
            <select
              className="input"
              value={enhed}
              onChange={e => setEnhed(e.target.value)}
            >
              {ENHEDER.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Enhedspris (kr.)</label>
            <input
              type="number"
              className="input"
              value={enhedspris}
              onChange={e => setEnhedspris(e.target.value)}
              placeholder="0"
              min="0"
              step="any"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Noter</label>
          <input
            type="text"
            className="input"
            value={noter}
            onChange={e => setNoter(e.target.value)}
            placeholder="Valgfri bemærkning..."
          />
        </div>

        <button className="btn btn-primary" onClick={tilfoejPost}>
          Tilføj til liste
        </button>
      </div>

      {/* Gem liste + Mine lister */}
      <div className="card">
        <h2>Mine lister</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            className="input"
            value={listeName}
            onChange={e => setListeName(e.target.value)}
            placeholder="Listenavn, f.eks. 'Terrasse Projekt'"
            onKeyDown={e => e.key === 'Enter' && handleSaveList()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSaveList}>Gem liste</button>
        </div>
        {savedLists.length > 0 ? (
          <div className="saved-lists">
            {savedLists.map(sl => (
              <div key={sl.id} className={`saved-list-item ${activeListId === sl.id ? 'active' : ''}`}>
                <div style={{ flex: 1 }}>
                  <strong>{sl.name}</strong>
                  <small className="text-muted" style={{ marginLeft: '0.5rem' }}>
                    {sl.list.length} poster · {formatKr(sl.grandTotal)} kr.
                  </small>
                </div>
                <div className="action-buttons">
                  <button className="btn btn-xs btn-primary" onClick={() => handleLoadList(sl)}>Indlæs</button>
                  <button className="btn btn-xs btn-danger" onClick={() => handleDeleteList(sl.id, sl.name)}>Slet</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Ingen gemte lister endnu. Gem din nuværende liste med et navn ovenfor.</p>
        )}
      </div>

      {list.length > 0 && (
        <div className="card">
          <h2>Materialeliste ({list.length} poster)</h2>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Navn</th>
                  <th>Antal</th>
                  <th>Enhed</th>
                  <th>Enhedspris</th>
                  <th>Total</th>
                  <th>Noter</th>
                  <th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, index) => {
                  const linjeTotal = item.antal * (item.enhedspris || 0);
                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.navn}</td>
                      <td>{item.antal}</td>
                      <td>{item.enhed}</td>
                      <td>{item.enhedspris ? `${formatKr(item.enhedspris)} kr.` : '\u2014'}</td>
                      <td>{item.enhedspris ? `${formatKr(linjeTotal)} kr.` : '\u2014'}</td>
                      <td>{item.noter || '\u2014'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm"
                            onClick={() => flytOp(index)}
                            disabled={index === 0}
                            title="Flyt op"
                          >
                            &uarr;
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => flytNed(index)}
                            disabled={index === list.length - 1}
                            title="Flyt ned"
                          >
                            &darr;
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => fjernPost(item.id)}
                            title="Fjern"
                          >
                            Fjern
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {harPriser && (
                <tfoot>
                  <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
                    <td colSpan={5} style={{ textAlign: 'right' }}>Samlet pris:</td>
                    <td>{formatKr(grandTotal())} kr.</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {msg && <div className="action-msg">{msg}</div>}

          <div className="action-buttons" style={{ marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={tilfoejTilSamletListe}>
              + Tilføj alle til samlet materialeliste
            </button>
          </div>
          <AffiliateLinks />
        </div>
      )}

      {list.length > 0 && (
        <div className="results-card">
          <h2>Opsummering</h2>
          <table>
            <tbody>
              {getResults().map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.label}</strong></td>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ResultActions
            toolType="materialeliste"
            toolPath="materialeliste"
            title="Materialeliste"
            inputs={getInputs()}
            results={getResults()}
            materialList={getMaterialList()}
            notes={null}
          />
        </div>
      )}
    </div>
  );
}
