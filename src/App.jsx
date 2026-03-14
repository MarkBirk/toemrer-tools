import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { getAdminSettings, updateAdminSettings } from './utils/storage';
import Layout from './components/Layout';
import SEO from './components/SEO';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ScriptInjector from './components/ScriptInjector';
import ToolCard from './components/ToolCard';
import SavedItems from './components/SavedItems';
import MaterialListCollector from './components/MaterialListCollector';
import AdminPanel from './components/AdminPanel';
import FAQ from './components/FAQ';
import { homeFaq, toolFaqs } from './data/faqData';
import tools from './data/tools';
import ToolsPage from './pages/ToolsPage';

import Materialeberegner from './tools/Materialeberegner';
import Taghaeldning from './tools/Taghaeldning';
import SpaerLaengde from './tools/SpaerLaengde';
import SkruerBeslag from './tools/SkruerBeslag';
import MaalKonverter from './tools/MaalKonverter';
import Tilbudsberegner from './tools/Tilbudsberegner';
import MaterialelisteGenerator from './tools/MaterialelisteGenerator';
import Standardmaal from './tools/Standardmaal';
import ByggeNoter from './tools/ByggeNoter';
import VaegtBeregner from './tools/VaegtBeregner';
import Skaereplan from './tools/Skaereplan';
import ByggeRegler from './tools/ByggeRegler';
import TimeTracker from './tools/TimeTracker';
import DocChecklist from './tools/DocChecklist';


function Home() {
  const [search, setSearch] = useState('');
  const [showAuth, setShowAuth] = useState(null);
  const filtered = tools.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <SEO
        title={null}
        description="14 gratis online værktøjer til håndværkere: materialeberegner, taghældning, skæreplan, tilbudsberegner, tidsregistrering, dokumentation og mere."
        path="/"
      />
      <LandingPage onOpenAuth={() => setShowAuth('signup')} />
      <div className="landing-divider" />
      <div className="search-bar">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Søg værktøj..."
          className="input search-input"
        />
      </div>
      <div className="tools-grid">
        {filtered.map(t => (
          <ToolCard key={t.path} {...t} />
        ))}
      </div>
      {filtered.length === 0 && <p className="text-muted text-center">Ingen værktøjer matcher søgningen.</p>}
      <FAQ items={homeFaq} />
      <div className="warning-box">
        <strong>Bemærk:</strong> Alle beregninger er vejledende og erstatter ikke professionel rådgivning. Tjek altid gældende bygningsreglement og konsultér en fagperson ved tvivl.
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(null)} initialMode={showAuth} />}
    </div>
  );
}

function Privatlivspolitik() {
  return (
    <div className="tool-page">
      <SEO title="Privatlivspolitik" description="Læs om hvordan HåndværkerTools håndterer dine data." path="/privatlivspolitik" />
      <h1>Privatlivspolitik</h1>
      <div className="card" style={{ lineHeight: 1.7 }}>
        <h2>Dataindsamling</h2>
        <p>HåndværkerTools indsamler <strong>ingen personlige oplysninger</strong>. Vi bruger ikke cookies, tracking eller analyse-værktøjer, medmindre det er aktiveret af siteadministratoren via admin-panelet (f.eks. Google Analytics).</p>

        <h2>Lokal lagring</h2>
        <p>Alle dine beregninger, materialelister og noter gemmes udelukkende i din browsers <strong>localStorage</strong>. Data forlader aldrig din enhed og sendes ikke til nogen server.</p>

        <h2>Tredjeparter</h2>
        <p>Vi bruger Google Fonts til typografi. Google kan registrere en sideanmodning når skrifttyper indlæses. Læs <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Googles privatlivspolitik</a> for detaljer.</p>

        <h2>E-mail-funktion</h2>
        <p>Hvis e-mail-funktionen er aktiveret, sendes beregningsdata kun til den adresse du selv angiver. Vi gemmer ikke e-mailadresser.</p>

        <h2>Kontakt</h2>
        <p>Har du spørgsmål om privatlivspolitikken? Kontakt os via <a href="mailto:kontakt@toemrertools.dk" style={{ color: 'var(--accent)' }}>kontakt@toemrertools.dk</a>.</p>

        <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sidst opdateret: marts 2026</p>
      </div>
    </div>
  );
}

function Kontakt() {
  const [form, setForm] = useState({ navn: '', email: '', emne: 'Spørgsmål', besked: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.navn.trim() || !form.email.trim() || !form.besked.trim()) {
      setError('Udfyld venligst alle felter.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Ugyldig e-mailadresse.');
      return;
    }
    setSending(true);
    try {
      const settings = getAdminSettings();
      const messages = settings.contactMessages || [];
      const newMsg = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        navn: form.navn.trim(),
        email: form.email.trim(),
        emne: form.emne,
        besked: form.besked.trim(),
        dato: new Date().toISOString(),
        laest: false,
        besvaret: false,
      };
      messages.unshift(newMsg);
      updateAdminSettings({ contactMessages: messages });
      setSent(true);
    } catch {
      setError('Noget gik galt. Prøv igen.');
    }
    setSending(false);
  }

  if (sent) {
    return (
      <div className="tool-page">
        <SEO title="Kontakt" description="Kontakt HåndværkerTools med spørgsmål, feedback eller fejlmeldinger." path="/kontakt" />
        <h1>Kontakt</h1>
        <div className="card contact-success">
          <h2>Tak for din henvendelse!</h2>
          <p>Vi har modtaget din besked og vender tilbage hurtigst muligt.</p>
          <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ navn: '', email: '', emne: 'Spørgsmål', besked: '' }); }}>
            Send en ny besked
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-page">
      <SEO title="Kontakt" description="Kontakt HåndværkerTools med spørgsmål, feedback eller fejlmeldinger." path="/kontakt" />
      <h1>Kontakt</h1>
      <div className="card">
        <p>Har du spørgsmål, feedback eller har du fundet en fejl? Udfyld formularen herunder, så vender vi tilbage hurtigst muligt.</p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Navn *</label>
            <input type="text" name="navn" className="input" value={form.navn} onChange={handleChange} placeholder="Dit navn" />
          </div>

          <div className="form-group">
            <label>E-mail *</label>
            <input type="email" name="email" className="input" value={form.email} onChange={handleChange} placeholder="din@email.dk" />
          </div>

          <div className="form-group">
            <label>Emne</label>
            <select name="emne" className="input" value={form.emne} onChange={handleChange}>
              <option value="Spørgsmål">Spørgsmål</option>
              <option value="Feedback">Feedback</option>
              <option value="Fejlmelding">Fejlmelding</option>
              <option value="Andet">Andet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Besked *</label>
            <textarea name="besked" className="input" rows={5} value={form.besked} onChange={handleChange} placeholder="Skriv din besked her..." />
          </div>

          {error && <div className="action-msg" style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Sender...' : 'Send besked'}
          </button>
        </form>
      </div>
    </div>
  );
}

function GemteSide() {
  return (
    <div className="tool-page">
      <SEO title="Gemte beregninger" description="Se og administrer dine gemte beregninger fra alle værktøjer." path="/gemte" />
      <h2>Gemte beregninger</h2>
      <SavedItems />
    </div>
  );
}

function SamletListeWrapper() {
  return (
    <>
      <SEO title="Samlet materialeliste" description="Saml materialer fra alle beregninger i én samlet liste. Eksportér som PDF, CSV eller e-mail." path="/samlet-liste" />
      <MaterialListCollector />
    </>
  );
}

// Wrapper to add SEO + FAQ to each tool route
function ToolRoute({ component: Component, seo, toolPath }) {
  const faq = toolFaqs[toolPath];
  return (
    <>
      <SEO title={seo.title} description={seo.description} path={seo.path} />
      <Component />
      {faq && <div className="tool-page"><FAQ items={faq} /></div>}
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <ScriptInjector />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gemte" element={<GemteSide />} />
        <Route path="/samlet-liste" element={<SamletListeWrapper />} />
        <Route path="/privatlivspolitik" element={<Privatlivspolitik />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/vaerktoejer" element={<ToolsPage />} />
        {tools.map(t => (
          <Route
            key={t.path}
            path={`/${t.path}`}
            element={
              <ToolRoute
                toolPath={t.path}
                component={{
                  materialeberegner: Materialeberegner,
                  taghaeldning: Taghaeldning,
                  'spaer-laengde': SpaerLaengde,
                  'skruer-beslag': SkruerBeslag,
                  'maal-konverter': MaalKonverter,
                  tilbudsberegner: Tilbudsberegner,
                  materialeliste: MaterialelisteGenerator,
                  standardmaal: Standardmaal,
                  'bygge-noter': ByggeNoter,
                  'vaegt-beregner': VaegtBeregner,
                  skaereplan: Skaereplan,
                  'bygge-regler': ByggeRegler,
                  tidsregistrering: TimeTracker,
                  dokumentation: DocChecklist,
                }[t.path]}
                seo={{ title: t.title, description: t.seoDesc, path: `/${t.path}` }}
              />
            }
          />
        ))}
      </Routes>
    </Layout>
  );
}
