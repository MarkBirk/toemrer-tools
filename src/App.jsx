import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import SEO from './components/SEO';
import ScriptInjector from './components/ScriptInjector';
import ToolCard from './components/ToolCard';
import SavedItems from './components/SavedItems';
import MaterialListCollector from './components/MaterialListCollector';
import AdminPanel from './components/AdminPanel';
import FAQ from './components/FAQ';
import { homeFaq, toolFaqs } from './data/faqData';

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
      <FAQ items={homeFaq} />
      <div className="warning-box">
        <strong>Bemærk:</strong> Alle beregninger er vejledende og erstatter ikke professionel rådgivning. Tjek altid gældende bygningsreglement og konsultér en fagperson ved tvivl.
      </div>
    </div>
  );
}

function Privatlivspolitik() {
  return (
    <div className="tool-page">
      <SEO title="Privatlivspolitik" description="Læs om hvordan Tømrer Tools håndterer dine data." path="/privatlivspolitik" />
      <h1>Privatlivspolitik</h1>
      <div className="card" style={{ lineHeight: 1.7 }}>
        <h2>Dataindsamling</h2>
        <p>Tømrer Tools indsamler <strong>ingen personlige oplysninger</strong>. Vi bruger ikke cookies, tracking eller analyse-værktøjer, medmindre det er aktiveret af siteadministratoren via admin-panelet (f.eks. Google Analytics).</p>

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
  return (
    <div className="tool-page">
      <SEO title="Kontakt" description="Kontakt Tømrer Tools med spørgsmål, feedback eller fejlmeldinger." path="/kontakt" />
      <h1>Kontakt</h1>
      <div className="card" style={{ lineHeight: 1.7 }}>
        <p>Har du spørgsmål, feedback eller har du fundet en fejl? Du er velkommen til at kontakte os.</p>

        <div style={{ margin: '1.5rem 0' }}>
          <div className="result-row">
            <span>E-mail</span>
            <strong><a href="mailto:kontakt@toemrertools.dk" style={{ color: 'var(--accent)' }}>kontakt@toemrertools.dk</a></strong>
          </div>
        </div>

        <h2>Feedback</h2>
        <p>Vi udvikler løbende nye værktøjer og forbedrer de eksisterende. Har du et ønske til et nyt beregningsværktøj eller en funktion, så skriv endelig.</p>

        <h2>Fejl og problemer</h2>
        <p>Oplever du en fejl i en beregning eller noget der ikke virker som forventet, vil vi meget gerne høre om det, så vi kan rette det hurtigst muligt.</p>
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
