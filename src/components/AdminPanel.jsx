import { useState, useEffect, useRef } from 'react';
import { getAdminSettings, updateAdminSettings, resetAdminSettings } from '../utils/storage';
import { CALC_DEFAULTS, getCalcDefaults } from '../utils/calcDefaults';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPatch } from '../services/api';

// Admin-adgangskode sættes som env-variabel i Netlify
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

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
  const [tab, setTab] = useState('users');
  const [message, setMessage] = useState(null);
  const importRef = useRef();

  useEffect(() => {
    const s = getAdminSettings();
    setSettings(s);
    if (sessionStorage.getItem('toemrer_admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Hvis VITE_ADMIN_PASSWORD ikke er sat, er admin utilgængeligt
  if (!ADMIN_PASSWORD) {
    return (
      <div className="tool-page">
        <div className="card admin-login-card">
          <h2>🔒 Admin ikke konfigureret</h2>
          <p className="text-muted">
            Admin panelet kræver en adgangskode sat som miljøvariabel.<br />
            Tilføj <code>VITE_ADMIN_PASSWORD</code> i Netlify under Site settings &gt; Environment variables, og deploy igen.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <PasswordGate onAuth={() => {
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
        <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Brugere</button>
        <button className={`tab-btn ${tab === 'henvendelser' ? 'active' : ''}`} onClick={() => setTab('henvendelser')}>
          Henvendelser
          {(() => { const c = (settings.contactMessages || []).filter(m => !m.laest).length; return c > 0 ? <span className="contact-badge">{c}</span> : null; })()}
        </button>
        <button className={`tab-btn ${tab === 'seo' ? 'active' : ''}`} onClick={() => setTab('seo')}>SEO</button>
        <button className={`tab-btn ${tab === 'calc' ? 'active' : ''}`} onClick={() => setTab('calc')}>Beregninger</button>
        <button className={`tab-btn ${tab === 'scripts' ? 'active' : ''}`} onClick={() => setTab('scripts')}>Scripts</button>
        <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Indstillinger</button>
      </div>

      {tab === 'users' && (
        <UsersTab showMessage={showMessage} />
      )}
      {tab === 'henvendelser' && (
        <ContactTab settings={settings} setSettings={setSettings} showMessage={showMessage} />
      )}
      {tab === 'seo' && (
        <SeoTab settings={settings} setSettings={setSettings} showMessage={showMessage} />
      )}
      {tab === 'calc' && (
        <CalcDefaultsTab settings={settings} setSettings={setSettings} showMessage={showMessage} />
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
function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (pw === ADMIN_PASSWORD) {
      onAuth();
    } else {
      setError('Forkert adgangskode.');
    }
  };

  return (
    <div className="tool-page">
      <div className="card admin-login-card">
        <h2>🔒 Admin Login</h2>
        <p className="text-muted">Indtast adgangskoden for at tilgå admin panelet.</p>
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
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Log ind</button>
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
  const [apiUrl, setApiUrl] = useState(settings.emailApiUrl || '');
  const [adminToken, setAdminToken] = useState(settings.emailAdminToken || '');
  const firma = settings.firma || {};
  const [firmaNavn, setFirmaNavn] = useState(firma.navn || '');
  const [firmaCvr, setFirmaCvr] = useState(firma.cvr || '');
  const [firmaAdresse, setFirmaAdresse] = useState(firma.adresse || '');
  const [firmaTelefon, setFirmaTelefon] = useState(firma.telefon || '');
  const [firmaEmail, setFirmaEmail] = useState(firma.email || '');
  const [firmaWebsite, setFirmaWebsite] = useState(firma.website || '');

  const handleSaveSite = () => {
    const updated = updateAdminSettings({ siteName, baseUrl });
    setSettings(updated);
    showMessage('Site-indstillinger gemt!');
  };

  const handleSaveEmail = () => {
    const updated = updateAdminSettings({ emailApiUrl: apiUrl, emailAdminToken: adminToken });
    setSettings(updated);
    showMessage('E-mail-indstillinger gemt!');
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
        localStorage.setItem('toemrer_admin_settings', JSON.stringify(data));
        setSettings(data);
        setSiteName(data.siteName || '');
        setBaseUrl(data.baseUrl || '');
        setApiUrl(data.emailApiUrl || '');
        setAdminToken(data.emailAdminToken || '');
        const f = data.firma || {};
        setFirmaNavn(f.navn || '');
        setFirmaCvr(f.cvr || '');
        setFirmaAdresse(f.adresse || '');
        setFirmaTelefon(f.telefon || '');
        setFirmaEmail(f.email || '');
        setFirmaWebsite(f.website || '');
        showMessage('Indstillinger importeret!');
      } catch {
        showMessage('Ugyldig JSON-fil.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetAll = () => {
    if (confirm('Er du sikker? Alle admin-indstillinger nulstilles (SEO, scripts, site, e-mail).')) {
      const reset = resetAdminSettings();
      setSettings(reset);
      setSiteName('');
      setBaseUrl('');
      setApiUrl('');
      setAdminToken('');
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
        <button className="btn btn-primary" onClick={handleSaveSite}>Gem</button>
      </div>

      <div className="card">
        <h3>Firmainformation</h3>
        <p className="text-muted">Bruges i tilbuds-PDF'er som afsender. Alle felter er valgfrie.</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Firmanavn</label>
            <input className="input" value={firmaNavn} onChange={e => setFirmaNavn(e.target.value)} placeholder="Dit Firma ApS" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>CVR-nr.</label>
            <input className="input" value={firmaCvr} onChange={e => setFirmaCvr(e.target.value)} placeholder="12345678" />
          </div>
        </div>
        <div className="form-group">
          <label>Adresse</label>
          <input className="input" value={firmaAdresse} onChange={e => setFirmaAdresse(e.target.value)} placeholder="Vestergade 10, 2720 Vanløse" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Telefon</label>
            <input className="input" value={firmaTelefon} onChange={e => setFirmaTelefon(e.target.value)} placeholder="12 34 56 78" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>E-mail</label>
            <input className="input" value={firmaEmail} onChange={e => setFirmaEmail(e.target.value)} placeholder="info@firma.dk" />
          </div>
        </div>
        <div className="form-group">
          <label>Website</label>
          <input className="input" value={firmaWebsite} onChange={e => setFirmaWebsite(e.target.value)} placeholder="www.firma.dk" />
        </div>
        <button className="btn btn-primary" onClick={() => {
          const updated = updateAdminSettings({ firma: { navn: firmaNavn, cvr: firmaCvr, adresse: firmaAdresse, telefon: firmaTelefon, email: firmaEmail, website: firmaWebsite } });
          setSettings(updated);
          showMessage('Firmainformation gemt!');
        }}>Gem firma</button>
      </div>

      <div className="card">
        <h3>E-mail (SMTP server)</h3>
        <p className="text-muted">Forbind til din e-mail-server, så besøgende kan få tilsendt beregninger som PDF.</p>
        <div className="form-group">
          <label>API URL</label>
          <input
            className="input"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://din-server.com/api"
          />
          <small className="text-muted">URL til din Express e-mail-server (se DEPLOY.md).</small>
        </div>
        <div className="form-group">
          <label>Admin Token</label>
          <input
            className="input"
            type="password"
            value={adminToken}
            onChange={e => setAdminToken(e.target.value)}
            placeholder="Hemmeligt token til e-mail API"
          />
          <small className="text-muted">Skal matche ADMIN_TOKEN på serveren.</small>
        </div>
        <button className="btn btn-primary" onClick={handleSaveEmail}>💾 Gem e-mail</button>
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
          Nulstiller SEO, scripts, site- og e-mail-indstillinger.
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

// ─── Calc Defaults Tab ──────────────────────────────
const CALC_SECTIONS = [
  {
    key: 'tilbud',
    title: 'Økonomi (Tilbudsberegner)',
    fields: [
      { key: 'timepris', label: 'Standard timepris', unit: 'kr.' },
      { key: 'avancePct', label: 'Standard avance', unit: '%' },
      { key: 'momsPct', label: 'Moms', unit: '%' },
    ],
  },
  {
    key: 'terrasse',
    title: 'Terrasse (Materialeberegner)',
    fields: [
      { key: 'boardWidth', label: 'Bræddebredde', unit: 'mm' },
      { key: 'boardGap', label: 'Mellemrum', unit: 'mm' },
      { key: 'joistSpacing', label: 'Strøafstand (c/c)', unit: 'mm' },
      { key: 'waste', label: 'Spild', unit: '%' },
    ],
  },
  {
    key: 'vaeg',
    title: 'Væg / Reglar',
    fields: [
      { key: 'wallHeight', label: 'Standard væghøjde', unit: 'm' },
      { key: 'studSpacing', label: 'Regelafstand (c/c)', unit: 'mm' },
      { key: 'plateWidth', label: 'Pladebredde', unit: 'mm' },
      { key: 'plateHeight', label: 'Pladehøjde', unit: 'mm' },
      { key: 'screwsPerM2', label: 'Gipsskruer pr. m²', unit: 'stk' },
    ],
  },
  {
    key: 'isolering',
    title: 'Isolering',
    fields: [
      { key: 'packageCoverage', label: 'Pakkedækning', unit: 'm²/pk' },
      { key: 'waste', label: 'Spild', unit: '%' },
    ],
  },
  {
    key: 'skruer',
    title: 'Skruer / Beslag',
    fields: [
      { key: 'boardWidth', label: 'Bræddebredde (terrasse)', unit: 'mm' },
      { key: 'joistSpacing', label: 'Bjælkeafstand', unit: 'mm' },
      { key: 'screwsPerCrossing', label: 'Skruer pr. krydsning', unit: 'stk' },
      { key: 'boardGap', label: 'Mellemrum', unit: 'mm' },
      { key: 'screwsPerM2', label: 'Gipsskruer pr. m²', unit: 'stk' },
    ],
  },
  {
    key: 'skaereplan',
    title: 'Skæreplan',
    fields: [
      { key: 'raaLaengde', label: 'Standard rålængde', unit: 'mm' },
      { key: 'snitBredde', label: 'Snitbredde (savsnit)', unit: 'mm' },
    ],
  },
];

function CalcDefaultsTab({ settings, setSettings, showMessage }) {
  const overrides = settings.calcDefaults || {};

  const handleChange = (section, field, value) => {
    const numVal = value === '' ? undefined : Number(value);
    const newSection = { ...(overrides[section] || {}) };
    if (numVal === undefined || isNaN(numVal)) {
      delete newSection[field];
    } else {
      newSection[field] = numVal;
    }
    // Clean up empty sections
    const newOverrides = { ...overrides, [section]: newSection };
    if (Object.keys(newSection).length === 0) delete newOverrides[section];
    const updated = updateAdminSettings({ calcDefaults: newOverrides });
    setSettings(updated);
  };

  const handleResetSection = (sectionKey) => {
    const newOverrides = { ...overrides };
    delete newOverrides[sectionKey];
    const updated = updateAdminSettings({ calcDefaults: newOverrides });
    setSettings(updated);
    showMessage(`Standardværdier nulstillet for "${CALC_SECTIONS.find(s => s.key === sectionKey)?.title || sectionKey}".`);
  };

  const handleResetAll = () => {
    if (confirm('Nulstil alle beregningsindstillinger til standardværdier?')) {
      const updated = updateAdminSettings({ calcDefaults: {} });
      setSettings(updated);
      showMessage('Alle beregningsindstillinger nulstillet.');
    }
  };

  const hasAnyOverride = Object.keys(overrides).some(k => Object.keys(overrides[k] || {}).length > 0);

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <p className="text-muted">Ændr standardværdier for beregningsværktøjerne. Tomme felter bruger de indbyggede standarder.</p>
        {hasAnyOverride && (
          <button className="btn btn-sm btn-danger" onClick={handleResetAll}>
            Nulstil alle
          </button>
        )}
      </div>

      {CALC_SECTIONS.map(section => {
        const sectionOverrides = overrides[section.key] || {};
        const sectionDefaults = CALC_DEFAULTS[section.key] || {};
        const hasOverride = Object.keys(sectionOverrides).length > 0;

        return (
          <div key={section.key} className={`card ${hasOverride ? 'admin-seo-active' : ''}`}>
            <div className="admin-seo-header">
              <h3 style={{ margin: 0 }}>{section.title}</h3>
              {hasOverride && (
                <button className="btn btn-xs btn-secondary" onClick={() => handleResetSection(section.key)}>
                  Nulstil
                </button>
              )}
            </div>
            {section.fields.map(field => (
              <div className="form-group" key={field.key}>
                <label>{field.label}</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    className="input"
                    value={sectionOverrides[field.key] ?? ''}
                    onChange={e => handleChange(section.key, field.key, e.target.value)}
                    placeholder={String(sectionDefaults[field.key])}
                    step="any"
                  />
                  <span className="input-suffix">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Densiteter section */}
      <div className={`card ${(overrides.densiteter && Object.keys(overrides.densiteter).length > 0) ? 'admin-seo-active' : ''}`}>
        <div className="admin-seo-header">
          <h3 style={{ margin: 0 }}>Densiteter (Vægtberegner)</h3>
          {overrides.densiteter && Object.keys(overrides.densiteter).length > 0 && (
            <button className="btn btn-xs btn-secondary" onClick={() => handleResetSection('densiteter')}>
              Nulstil
            </button>
          )}
        </div>
        <p className="text-muted" style={{ marginBottom: '0.75rem' }}>Gennemsnitlige densiteter brugt til vægtberegning.</p>
        {Object.entries(CALC_DEFAULTS.densiteter).map(([material, defaultDensity]) => (
          <div className="form-group" key={material}>
            <label>{material}</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="input"
                value={(overrides.densiteter || {})[material] ?? ''}
                onChange={e => handleChange('densiteter', material, e.target.value)}
                placeholder={String(defaultDensity)}
                step="any"
              />
              <span className="input-suffix">kg/m³</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────
function UsersTab({ showMessage }) {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [usersData, statsData] = await Promise.all([
        apiGet('/api/admin/users'),
        apiGet('/api/admin/stats'),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePro(userId) {
    try {
      await apiPatch(`/api/admin/users/${userId}/pro`);
      showMessage('Pro-status opdateret.');
      loadData();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }

  async function toggleDisabled(userId) {
    try {
      await apiPatch(`/api/admin/users/${userId}/disable`);
      showMessage('Bruger-status opdateret.');
      loadData();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }

  if (error) {
    return (
      <div className="admin-tab-content">
        <div className="card">
          <h3>Brugerstyring</h3>
          <p className="text-muted">
            {error.includes('503') || error.includes('Database')
              ? 'Database ikke konfigureret. Tilføj DB_HOST, DB_USER, DB_PASS og DB_NAME som miljøvariabler.'
              : error.includes('403')
              ? 'Du skal være logget ind som admin (via Supabase/MySQL) for at se brugere.'
              : error}
          </p>
          <button className="btn btn-secondary" onClick={loadData} style={{ marginTop: 12 }}>
            Prøv igen
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-tab-content">
        <p className="text-muted">Indlæser brugere...</p>
      </div>
    );
  }

  return (
    <div className="admin-tab-content">
      {/* Stats */}
      {stats && (
        <div className="admin-stats-row">
          <div className="card admin-stat-card">
            <strong className="admin-stat-number">{stats.total}</strong>
            <span className="admin-stat-label">Brugere i alt</span>
          </div>
          <div className="card admin-stat-card">
            <strong className="admin-stat-number">{stats.pro}</strong>
            <span className="admin-stat-label">Pro-brugere</span>
          </div>
          <div className="card admin-stat-card">
            <strong className="admin-stat-number">{stats.recent}</strong>
            <span className="admin-stat-label">Nye (30 dage)</span>
          </div>
          <div className="card admin-stat-card">
            <strong className="admin-stat-number">{stats.waitlist}</strong>
            <span className="admin-stat-label">Venteliste</span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <h3>Brugerbasen ({users.length})</h3>
        {users.length === 0 ? (
          <p className="text-muted">Ingen brugere endnu.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Oprettet</th>
                  <th>Seneste login</th>
                  <th>Pro</th>
                  <th>Status</th>
                  <th>Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.disabled ? 'admin-row-disabled' : ''}>
                    <td>{u.email}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('da-DK')}</td>
                    <td>{u.last_login ? new Date(u.last_login).toLocaleDateString('da-DK') : '–'}</td>
                    <td>{u.pro_status ? 'Ja' : 'Nej'}</td>
                    <td>{u.disabled ? 'Deaktiveret' : 'Aktiv'}</td>
                    <td className="admin-actions-cell">
                      <button className="btn btn-xs btn-secondary" onClick={() => togglePro(u.id)}>
                        {u.pro_status ? 'Fjern Pro' : 'Giv Pro'}
                      </button>
                      <button className="btn btn-xs btn-danger" onClick={() => toggleDisabled(u.id)}>
                        {u.disabled ? 'Aktivér' : 'Deaktivér'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contact / Henvendelser Tab ──────────────────────
function ContactTab({ settings, setSettings, showMessage }) {
  const [expandedId, setExpandedId] = useState(null);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  const messages = settings.contactMessages || [];

  function updateMessages(newMessages) {
    const updated = updateAdminSettings({ contactMessages: newMessages });
    setSettings(updated);
  }

  function toggleRead(id) {
    const newMessages = messages.map(m =>
      m.id === id ? { ...m, laest: !m.laest } : m
    );
    updateMessages(newMessages);
  }

  function handleDelete(id) {
    if (!confirm('Slet denne henvendelse?')) return;
    updateMessages(messages.filter(m => m.id !== id));
    showMessage('Henvendelse slettet.');
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
    if (replyId === id) { setReplyId(null); setReplyText(''); }
  }

  function openReply(msg) {
    setReplyId(msg.id);
    setReplyText('');
    setExpandedId(msg.id);
  }

  async function sendReply(msg) {
    if (!replyText.trim()) return;
    const adminToken = settings.emailAdminToken || '';
    const apiUrl = settings.emailApiUrl || '/api';

    if (!adminToken || !apiUrl) {
      // Fallback: mailto
      const subject = encodeURIComponent(`Re: ${msg.emne} — HåndværkerTools`);
      const body = encodeURIComponent(replyText);
      window.open(`mailto:${msg.email}?subject=${subject}&body=${body}`, '_blank');
      // Markér som besvaret
      const newMessages = messages.map(m =>
        m.id === msg.id ? { ...m, besvaret: true, laest: true } : m
      );
      updateMessages(newMessages);
      setReplyId(null);
      setReplyText('');
      showMessage('Mailto åbnet — markeret som besvaret.');
      return;
    }

    setReplySending(true);
    try {
      const res = await fetch(`${apiUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({
          to: [msg.email],
          subject: `Re: ${msg.emne} — HåndværkerTools`,
          html: `<p>${replyText.replace(/\n/g, '<br>')}</p><hr><p><em>Oprindelig henvendelse fra ${msg.navn}:</em></p><p>${msg.besked.replace(/\n/g, '<br>')}</p>`,
          text: replyText + '\n\n---\nOprindelig henvendelse:\n' + msg.besked,
        })
      });
      const json = await res.json();
      if (json.success) {
        const newMessages = messages.map(m =>
          m.id === msg.id ? { ...m, besvaret: true, laest: true } : m
        );
        updateMessages(newMessages);
        setReplyId(null);
        setReplyText('');
        showMessage('Svar sendt!');
      } else {
        showMessage(json.error || 'Kunne ikke sende.', 'error');
      }
    } catch {
      showMessage('Serverfejl — prøv mailto i stedet.', 'error');
    }
    setReplySending(false);
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const ulaesteCount = messages.filter(m => !m.laest).length;

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <p className="text-muted">
          {messages.length} henvendelse{messages.length !== 1 ? 'r' : ''} total
          {ulaesteCount > 0 && ` · ${ulaesteCount} ulæst${ulaesteCount !== 1 ? 'e' : ''}`}
        </p>
        {messages.length > 0 && (
          <button className="btn btn-sm btn-secondary" onClick={() => {
            const newMessages = messages.map(m => ({ ...m, laest: true }));
            updateMessages(newMessages);
            showMessage('Alle markeret som læst.');
          }}>
            Markér alle som læst
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="card">
          <p className="text-muted">Ingen henvendelser endnu.</p>
        </div>
      ) : (
        <div className="contact-list">
          {messages.map(msg => (
            <div key={msg.id} className={`contact-card ${!msg.laest ? 'contact-unread' : ''} ${expandedId === msg.id ? 'contact-expanded' : ''}`}>
              <div className="contact-card-header" onClick={() => toggleExpand(msg.id)}>
                <div className="contact-card-meta">
                  {!msg.laest && <span className="contact-dot" />}
                  <strong>{msg.navn}</strong>
                  <span className="text-muted">{msg.email}</span>
                </div>
                <div className="contact-card-right">
                  <span className="badge">{msg.emne}</span>
                  {msg.besvaret && <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>Besvaret</span>}
                  <small className="text-muted">{formatDate(msg.dato)}</small>
                </div>
              </div>

              {expandedId === msg.id && (
                <div className="contact-card-body">
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.besked}</p>

                  <div className="action-buttons" style={{ marginTop: '1rem' }}>
                    <button className="btn btn-xs" onClick={() => toggleRead(msg.id)}>
                      {msg.laest ? 'Markér ulæst' : 'Markér læst'}
                    </button>
                    <button className="btn btn-xs btn-primary" onClick={() => openReply(msg)}>
                      Svar
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(msg.id)}>
                      Slet
                    </button>
                  </div>

                  {replyId === msg.id && (
                    <div style={{ marginTop: '1rem' }}>
                      <textarea
                        className="input"
                        rows={4}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`Svar til ${msg.email}...`}
                      />
                      <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => sendReply(msg)} disabled={replySending}>
                          {replySending ? 'Sender...' : 'Send svar'}
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setReplyId(null); setReplyText(''); }}>
                          Annuller
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
