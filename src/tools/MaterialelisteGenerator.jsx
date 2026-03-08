import { useState, useEffect } from 'react';
import ResultActions from '../components/ResultActions';
import { parseShareFromURL } from '../utils/shareLink';
import { addToMaterialList } from '../utils/storage';

const ENHEDER = ['stk', 'm', 'm²', 'm³', 'kg', 'pakke', 'rulle'];

export default function MaterialelisteGenerator() {
  const [list, setList] = useState([]);
  const [navn, setNavn] = useState('');
  const [antal, setAntal] = useState('');
  const [enhed, setEnhed] = useState('stk');
  const [noter, setNoter] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const shared = parseShareFromURL();
    if (shared && shared.inputs && shared.inputs.list) {
      setList(shared.inputs.list);
    }
  }, []);

  function tilfoejPost() {
    if (!navn.trim()) return;
    const antalVal = parseFloat(antal);
    if (!antalVal || antalVal <= 0) return;

    const nyPost = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      navn: navn.trim(),
      antal: antalVal,
      enhed,
      noter: noter.trim(),
    };

    setList(prev => [...prev, nyPost]);
    setNavn('');
    setAntal('');
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

  function getInputs() {
    return { list };
  }

  function getResults() {
    return [
      { label: 'Antal poster', value: list.length },
      { label: 'Total enheder', value: totalEnheder() },
    ];
  }

  function getMaterialList() {
    return list.map(item => ({
      navn: item.navn,
      antal: item.antal,
      enhed: item.enhed,
      noter: item.noter,
    }));
  }

  return (
    <div className="tool-page">
      <h1>Materialeliste-generator</h1>
      <p>Opret en materialeliste ved at tilføje poster \én ad gangen.</p>

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

        <div className="form-group">
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

        <div className="form-group">
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
                  <th>Noter</th>
                  <th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.navn}</td>
                    <td>{item.antal}</td>
                    <td>{item.enhed}</td>
                    <td>{item.noter || '\—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm"
                          onClick={() => flytOp(index)}
                          disabled={index === 0}
                          title="Flyt op"
                        >
                          \↑
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => flytNed(index)}
                          disabled={index === list.length - 1}
                          title="Flyt ned"
                        >
                          \↓
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
                ))}
              </tbody>
            </table>
          </div>

          {msg && <div className="action-msg">{msg}</div>}

          <div className="action-buttons" style={{ marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={tilfoejTilSamletListe}>
              + Tilføj alle til samlet materialeliste
            </button>
          </div>
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
