import { useState, useEffect, useRef } from 'react';
import { getAdminSettings, updateAdminSettings, resetAdminSettings } from '../utils/storage';

// Alle sider i appen med deres hardcoded defaults
const ALL_PAGES = [
  { path: '/', label: 'Forside', defaultTitle: '', defaultDesc: '12 gratis online beregningsværktøjer til tømrere: materialeberegner, taghældning, skæreplan, tilbudsberegner, vægtberegner og mere.' },
  { path: '/materialeberegner', label: 'Materialeberegner', defaultTitle: 'Materialeberegner', defaultDesc: 'Beregn materialer til terrasse, vægge og isolering. Få brædder, strøer, skruer, reglar og isolering med spild%.' },
  { path: '/taghaeldning', label: 'Taghældning', defaultTitle: 'Taghældning', defaultDesc: 'Beregn taghældning i grader, procent og 1:X forholdstal ud fra højdeforskel og vandret længde.' },
  { path: '/spaer-laengde', label: 'Spærlængde', defaultTitle: 'Spærlængde', defaultDesc: 'Beregn spærlængde med Pythagoras. Indtast spænd og højde – få spærlængde og kiphøjde.' },
  { path: '/skruer-beslag', label: 'Skruer/Beslag', defaultTitle: 'Skruer/Beslag', defaultDesc: 'Estimér antal skruer til terrasse og gipsvægge ud fra areal og standardregler.' },
  { path: '/maal-konverter', label: 'Mål-konverter', defaultTitle: 'Mål-konverter', defaultDesc: 'Konvertér mellem tommer, mm, cm, meter og beregn antal plader ud fra m².' },
  { path: '/tilbudsberegner', label: 'Tilbudsberegner', defaultTitle: 'Tilbudsberegner', defaultDesc: 'Beregn tilbudspris med materialer, arbejdstimer, avance og moms. Generér tilbudstekst.' },
  { path: '/materialeliste', label: 'Materialeliste', defaultTitle: 'Materialeliste', defaultDesc: 'Opbyg en materialeliste manuelt eller fra beregninger. Eksportér som PDF, CSV eller JSON.' },
  { path: '/standardmaal', label: 'Standardmål', defaultTitle: 'Standardmål', defaultDesc: 'Opslagstabel med standardmål for tømrermaterialer: træ, plader, skruer, isolering, afstande.' },
  { path: '/bygge-noter', label: 'Bygge-noter', defaultTitle: 'Bygge-noter', defaultDesc: 'Skriv og organiser noter per byggeprojekt. Gemt lokalt i din browser.' },
  { path: '/vaegt-beregner', label: 'Hvad vejer det?', defaultTitle: 'Hvad vejer det?', defaultDesc: 'Beregn vægten af træ, plader, beton og stål ud fra dimensioner og materialetype.' },
  { path: '/skaereplan', label: 'Skæreplan', defaultTitle: 'Skæreplan', defaultDesc: 'Optimér skæring af brædder og plader. Minimér spild med automatisk skæreplan.' },
  { path: '/bygge-regler', label: 'Bygge-regler', defaultTitle: 'Bygge-regler', defaultDesc: 'Hurtig opslagsbog med danske byggeregler: BR18, skel, brand, isolering, vådrum m.m.' },
  { path: '/gemte', label: 'Gemte beregninger', defaultTitle: 'Gemte beregninger', defaultDesc: 'Se og administrer dine gemte beregninger fra alle værktøjer.' },
  { path: '/samlet-liste', label: 'Samlet materialeliste', defaultTitle: 'Samlet materialeliste', defaultDesc: 'Saml materialer fra alle beregninger i én samlet liste. Eksportér som PDF, CSV eller e-mail.' },
];

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [settings, setSettings] = useState({});
  const [tab, setTab] = useState('seo');
  const [message, setMessage] = useState(null);
  const importRef = useRef();

  useEffect(() => {
    const s = getAdminSettings();
    setSettings(s);
    // Tjek om brugeren allerede er logget ind i denne session
    if (sessionStorage.getItem('toemrer_admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ─── Password Gate ─────────────────────────────────
  if (!authenticated) {
    return <PasswordGate settings={settings} onAuth={() => {
      setAuthenticated(true);
      sessionStorage.setItem('toemrer_admin_auth', 'true');
      setSettings(getAdminSettings());
    }} />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('toemrer_admin_auth');
    setAuthenticated(false);
  };

  return (
    <div className="tool-page admin-panel">
      <div className="admin-header">
        <h2>⚙️ Admin Panel</h2>
        <button className="btn btn-sm btn-secondary" onClick={handleLogout}>Log ud</button>
      </div>

      {message && (
        <div className={`admin-message admin-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'seo' ? 'active' : ''}`} onClick={() => setTab('seo')}>SEO</button>
        <button className={`tab-btn ${tab === 'scripts' ? 'active' : ''}`} onClick={() => setTab('scripts')}>Scripts</button>
        <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Indstillinger</button>
      </div>

      {tab === 'seo' && (
        <SeoTab settings={settings} setSettings={setSettings} showMessage={showMessage} />
      )}
      {tab === 'scripts' && (
        <ScriptsTab settings={settings} setSettings={setSettings} showMessage={showMessage} />
      )}
      {tab === 'settings' && (
        <SettingsTab
          settings={settings}
          setSettings={setSettings}
          showMessage={showMessage}
          importRef={importRef}
        />
      )}
    </div>
  );
}

// ─── Password Gate Component ─────────────────────────
function PasswordGate({ settings, onAuth }) {
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const isFirstTime = !settings.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isFirstTime) {
      if (pw.length < 4) {
        setError('Adgangskoden skal være mindst 4 tegn.');
        return;
      }
      if (pw !== confirmPw) {
        setError('Adgangskoderne matcher ikke.');
        return;
      }
      updateAdminSettings({ password: pw });
      onAuth();
    } else {
      if (pw === settings.password) {
        onAuth();
      } else {
        setError('Forkert adgangskode.');
      }
    }
  };

  return (
    <div className="tool-page">
      <div className="card admin-login-card">
        <h2>🔒 {isFirstTime ? 'Opret admin-adgangskode' : 'Admin Login'}</h2>
        <p className="text-muted">
          {isFirstTime
            ? 'Vælg en adgangskode til admin panelet. Den gemmes lokalt i din browser.'
            : 'Indtast din adgangskode for at tilgå admin panelet.'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Adgangskode</label>
            <input
              className="input"
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Indtast adgangskode"
              autoFocus
            />
          </div>
          {isFirstTime && (
            <div className="form-group">
              <label>Bekræft adgangskode</label>
              <input
                className="input"
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Gentag adgangskode"
              />
            </div>
          )}
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">
            {isFirstTime ? 'Opret & log ind' : 'Log ind'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── SEO Tab ─────────────────────────────────────────
function SeoTab({ settings, setSettings, showMessage }) {
  const overrides = settings.seoOverrides || {};

  const handleChange = (path, field, value) => {
    const newOverrides = {
      ...overrides,
      [path]: {
        ...(overrides[path] || {}),
        [field]: value
      }
    };
    const updated = updateAdminSettings({ seoOverrides: newOverrides });
    setSettings(updated);
  };

  const handleReset = (path) => {
    const newOverrides = { ...overrides };
    delete newOverrides[path];
    const updated = updateAdminSettings({ seoOverrides: newOverrides });
    setSettings(updated);
    showMessage(`SEO nulstillet for "${ALL_PAGES.find(p => p.path === path)?.label}"`);
  };

  const handleResetAll = () => {
    if (confirm('Nulstil alle SEO-overrides? Siderne vil bruge standard-titler og beskrivelser.')) {
      const updated = updateAdminSettings({ seoOverrides: {} });
      setSettings(updated);
      showMessage('Alle SEO-overrides nulstillet.');
    }
  };

  const activeCount = Object.keys(overrides).filter(k =>
    overrides[k]?.title || overrides[k]?.description
  ).length;

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <p className="text-muted">Redigér SEO-titler og meta-beskrivelser for hver side. Tomme felter bruger standard-værdier.</p>
        {activeCount > 0 && (
          <button className="btn btn-sm btn-danger" onClick={handleResetAll}>
            Nulstil alle ({activeCount})
          </button>
        )}
      </div>

      {ALL_PAGES.map(page => {
        const override = overrides[page.path] || {};
        const hasOverride = override.title || override.description;

        return (
          <div key={page.path} className={`card admin-seo-card ${hasOverride ? 'admin-seo-active' : ''}`}>
            <div className="admin-seo-header">
              <strong>{page.label}</strong>
              <span className="text-muted admin-seo-path">{page.path}</span>
              {hasOverride && (
                <button className="btn btn-xs btn-secondary" onClick={() => handleReset(page.path)}>
                  Nulstil
                </button>
              )}
            </div>
            <div className="form-group">
              <label>Titel</label>
              <input
                className="input"
                value={override.title || ''}
                onChange={e => handleChange(page.path, 'title', e.target.value)}
                placeholder={page.defaultTitle || 'Tømrer Tools – Beregningsværktøjer til tømrere'}
              />
            </div>
            <div className="form-group">
              <label>Meta-beskrivelse</label>
              <textarea
                className="input admin-textarea-sm"
                value={override.description || ''}
                onChange={e => handleChange(page.path, 'description', e.target.value)}
                placeholder={page.defaultDesc}
                rows={2}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Scripts Tab ─────────────────────────────────────
function ScriptsTab({ settings, setSettings, showMessage }) {
  const [headerScripts, setHeaderScripts] = useState(settings.headerScripts || '');
  const [bodyScripts, setBodyScripts] = useState(settings.bodyScripts || '');

  const handleSave = () => {
    const updated = updateAdminSettings({ headerScripts, bodyScripts });
    setSettings(updated);
    showMessage('Scripts gemt! Genindlæs siden for at aktivere ændringer.');
  };

  return (
    <div className="admin-tab-content">
      <div className="card">
        <h3>Header Scripts</h3>
        <p className="text-muted">Indsættes i &lt;head&gt; på alle sider. Bruges til f.eks. Google Analytics, Meta Pixel, Google Tag Manager.</p>
        <textarea
          className="input admin-textarea-code"
          value={headerScripts}
          onChange={e => setHeaderScripts(e.target.value)}
          placeholder={'<!-- Eksempel: Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'G-XXXXXXX\');\n</script>'}
          rows={8}
          spellCheck={false}
        />
      </div>

      <div className="card">
        <h3>Body Scripts</h3>
        <p className="text-muted">Indsættes nederst i &lt;body&gt; på alle sider. Bruges til f.eks. chat-widgets, cookie-banners.</p>
        <textarea
          className="input admin-textarea-code"
          value={bodyScripts}
          onChange={e => setBodyScripts(e.target.value)}
          placeholder={'<!-- Eksempel: Chat widget -->\n<script src="https://widget.example.com/chat.js"></script>'}
          rows={6}
          spellCheck={false}
        />
      </div>

      <button className="btn btn-primary btn-block" onClick={handleSave}>
        💾 Gem scripts
      </button>
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────
function SettingsTab({ settings, setSettings, showMessage, importRef }) {
  const [siteName, setSiteName] = useState(settings.siteName || '');
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl || '');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  const handleSaveSite = () => {
    const updated = updateAdminSettings({ siteName, baseUrl });
    setSettings(updated);
    showMessage('Site-indstillinger gemt!');
  };

  const handleChangePw = () => {
    setPwError('');
    if (newPw.length < 4) {
      setPwError('Mindst 4 tegn.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Adgangskoderne matcher ikke.');
      return;
    }
    const updated = updateAdminSettings({ password: newPw });
    setSettings(updated);
    setNewPw('');
    setConfirmPw('');
    showMessage('Adgangskode ændret!');
  };

  const handleExport = () => {
    const data = JSON.stringify(getAdminSettings(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toemrer-admin-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Indstillinger eksporteret!');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (typeof data !== 'object') throw new Error();
        // Behold nuværende password medmindre importfilen har et
        const currentPw = settings.password;
        const imported = { ...data };
        if (!imported.password && currentPw) {
          imported.password = currentPw;
        }
        localStorage.setItem('toemrer_admin_settings', JSON.stringify(imported));
        setSettings(imported);
        setSiteName(imported.siteName || '');
        setBaseUrl(imported.baseUrl || '');
        showMessage('Indstillinger importeret!');
      } catch {
        showMessage('Ugyldig JSON-fil.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetAll = () => {
    if (confirm('Er du sikker? Alle admin-indstillinger nulstilles. Din adgangskode beholdes.')) {
      const reset = resetAdminSettings();
      setSettings(reset);
      setSiteName('');
      setBaseUrl('');
      showMessage('Alle indstillinger nulstillet!');
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="card">
        <h3>Site-indstillinger</h3>
        <div className="form-group">
          <label>Site Name</label>
          <input
            className="input"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            placeholder="Tømrer Tools"
          />
          <small className="text-muted">Overrider sidetitel-prefix på alle sider.</small>
        </div>
        <div className="form-group">
          <label>Base URL (canonical)</label>
          <input
            className="input"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://toemrer-tools.netlify.app"
          />
          <small className="text-muted">Bruges til canonical URL'er og Open Graph.</small>
        </div>
        <button className="btn btn-primary" onClick={handleSaveSite}>💾 Gem</button>
      </div>

      <div className="card">
        <h3>Skift adgangskode</h3>
        <div className="form-group">
          <label>Ny adgangskode</label>
          <input
            className="input"
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="Ny adgangskode (min. 4 tegn)"
          />
        </div>
        <div className="form-group">
          <label>Bekræft</label>
          <input
            className="input"
            type="password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Gentag ny adgangskode"
          />
        </div>
        {pwError && <p className="admin-error">{pwError}</p>}
        <button className="btn btn-primary" onClick={handleChangePw}>🔑 Skift adgangskode</button>
      </div>

      <div className="card">
        <h3>Data</h3>
        <div className="admin-data-buttons">
          <button className="btn btn-secondary" onClick={handleExport}>
            📥 Eksportér indstillinger (JSON)
          </button>
          <button className="btn btn-secondary" onClick={() => importRef.current?.click()}>
            📤 Importér indstillinger
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
        <hr className="admin-divider" />
        <button className="btn btn-danger" onClick={handleResetAll}>
          🗑 Nulstil alle indstillinger
        </button>
        <small className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>
          Nulstiller SEO, scripts og site-indstillinger. Din adgangskode beholdes.
        </small>
      </div>

      {settings.lastUpdated && (
        <p className="text-muted text-center" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          Sidst opdateret: {new Date(settings.lastUpdated).toLocaleString('da-DK')}
        </p>
      )}
    </div>
  );
}
