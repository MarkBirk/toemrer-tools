import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import SEO from './components/SEO';
import ScriptInjector from './components/ScriptInjector';
import ToolCard from './components/ToolCard';
import SavedItems from './components/SavedItems';
import MaterialListCollector from './components/MaterialListCollector';
import AdminPanel from './components/AdminPanel';

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

const tools = [
  { path: 'materialeberegner', title: 'Materialeberegner', description: 'Terrasse, væg/reglar, isolering', seoDesc: 'Beregn materialer til terrasse, vægge og isolering. Få brædder, strøer, skruer, reglar og isolering med spild%.' },
  { path: 'taghaeldning', title: 'Taghældning', description: 'Grader, procent, 1:X', seoDesc: 'Beregn taghældning i grader, procent og 1:X forholdstal ud fra højdeforskel og vandret længde.' },
  { path: 'spaer-laengde', title: 'Spærlængde', description: 'Pythagoras: spænd → længde', seoDesc: 'Beregn spærlængde med Pythagoras. Indtast spænd og højde – få spærlængde og kiphøjde.' },
  { path: 'skruer-beslag', title: 'Skruer/Beslag', description: 'Estimér skruer til terrasse/gips', seoDesc: 'Estimér antal skruer til terrasse og gipsvægge ud fra areal og standardregler.' },
  { path: 'maal-konverter', title: 'Mål-konverter', description: 'Tommer, mm, cm, m, m²↔plader', seoDesc: 'Konvertér mellem tommer, mm, cm, meter og beregn antal plader ud fra m².' },
  { path: 'tilbudsberegner', title: 'Tilbudsberegner', description: 'Materialer + timer → tilbud', seoDesc: 'Beregn tilbudspris med materialer, arbejdstimer, avance og moms. Generér tilbudstekst.' },
  { path: 'materialeliste', title: 'Materialeliste', description: 'Opbyg og eksportér materialeliste', seoDesc: 'Opbyg en materialeliste manuelt eller fra beregninger. Eksportér som PDF, CSV eller JSON.' },
  { path: 'standardmaal', title: 'Standardmål', description: 'Husketabel: træ, plader, skruer m.m.', seoDesc: 'Opslagstabel med standardmål for tømrermaterialer: træ, plader, skruer, isolering, afstande.' },
  { path: 'bygge-noter', title: 'Bygge-noter', description: 'Noter pr. projekt, gemt lokalt', seoDesc: 'Skriv og organiser noter per byggeprojekt. Gemt lokalt i din browser.' },
  { path: 'vaegt-beregner', title: 'Hvad vejer det?', description: 'Vægt af træ, plader, beton m.m.', seoDesc: 'Beregn vægten af træ, plader, beton og stål ud fra dimensioner og materialetype.' },
  { path: 'skaereplan', title: 'Skæreplan', description: 'Optimér skæring, minimér spild', seoDesc: 'Optimér skæring af brædder og plader. Minimér spild med automatisk skæreplan.' },
  { path: 'bygge-regler', title: 'Bygge-regler', description: 'Ofte brugte regler/krav (reference)', seoDesc: 'Hurtig opslagsbog med danske byggeregler: BR18, skel, brand, isolering, vådrum m.m.' },
];

function Home() {
  const [search, setSearch] = useState('');
  const filtered = tools.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <SEO
        title={null}
        description="12 gratis online beregningsværktøjer til tømrere: materialeberegner, taghældning, skæreplan, tilbudsberegner, vægtberegner og mere."
        path="/"
      />
      <div className="home-header">
        <h1>Tømrer Tools</h1>
        <p>Praktiske beregningsværktøjer til tømreren</p>
      </div>
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

      <div className="home-settings">
        <details>
          <summary>Indstillinger</summary>
          <div className="card mt-1">
            <div className="form-group">
              <label>API URL (e-mail server)</label>
              <input
                className="input"
                defaultValue={localStorage.getItem('toemrer_api_url') || ''}
                placeholder="http://localhost:3001/api"
                onChange={e => {
                  if (e.target.value) localStorage.setItem('toemrer_api_url', e.target.value);
                  else localStorage.removeItem('toemrer_api_url');
                }}
              />
            </div>
            <div className="form-group">
              <label>Admin token</label>
              <input
                className="input"
                type="password"
                defaultValue={localStorage.getItem('toemrer_admin_token') || ''}
                placeholder="Token til e-mail API"
                onChange={e => {
                  if (e.target.value) localStorage.setItem('toemrer_admin_token', e.target.value);
                  else localStorage.removeItem('toemrer_admin_token');
                }}
              />
            </div>
          </div>
        </details>
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

// Wrapper to add SEO to each tool route
function ToolRoute({ component: Component, seo }) {
  return (
    <>
      <SEO title={seo.title} description={seo.description} path={seo.path} />
      <Component />
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
        <Route path="/admin" element={<AdminPanel />} />
        {tools.map(t => (
          <Route
            key={t.path}
            path={`/${t.path}`}
            element={
              <ToolRoute
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
