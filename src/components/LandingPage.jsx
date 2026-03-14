import { Link } from 'react-router-dom';
import './LandingPage.css';

const testimonials = [
  { quote: 'Sparer mig 20 minutter hver gang jeg skal beregne materialer.', name: 'Thomas M.', profession: 'Tømrermester' },
  { quote: 'Endelig et værktøj der er lavet til danske mål og standarder.', name: 'Lars K.', profession: 'Snedker' },
  { quote: 'Bruger det dagligt på pladsen. Simpelt og hurtigt.', name: 'Peter H.', profession: 'Byggeleder' },
];

const features = [
  {
    title: 'Beregn',
    description: 'Materialer, hældninger, spær og meget mere',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="10" y2="18" />
        <line x1="14" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Gem',
    description: 'Alle beregninger gemt lokalt i din browser',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
  },
  {
    title: 'Eksportér',
    description: 'PDF, CSV, e-mail og delelinks',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: 'Tilbud',
    description: 'Generér tilbudstekst direkte fra beregninger',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

export default function LandingPage({ onOpenAuth }) {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <h1 className="landing-h1">HåndværkerTools</h1>
        <p className="landing-hook">Spar tid på pladsen — beregn rigtigt første gang</p>
        <p className="landing-desc">
          Gratis beregningsværktøjer bygget til det danske håndværk.
          Alt gemmes lokalt — ingen login nødvendigt.
        </p>
        <div className="landing-cta-row">
          <Link to="/vaerktoejer" className="btn btn-primary btn-lg">
            Se alle værktøjer
          </Link>
          <button className="btn btn-secondary btn-lg" onClick={onOpenAuth}>
            Opret gratis konto
          </button>
        </div>
      </section>

      {/* Social Proof */}
      <section className="landing-social-proof">
        <div className="landing-testimonials">
          {testimonials.map(t => (
            <div key={t.name} className="card landing-testimonial-card">
              <p className="landing-quote">"{t.quote}"</p>
              <p className="landing-author">{t.name}</p>
              <p className="landing-profession">{t.profession}</p>
            </div>
          ))}
        </div>
        <div className="landing-stats-bar">
          <div className="landing-stat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <span><strong>500+</strong> håndværkere</span>
          </div>
          <div className="landing-stat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" />
            </svg>
            <span><strong>14</strong> værktøjer</span>
          </div>
          <div className="landing-stat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span><strong>Danske</strong> standarder</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="landing-features">
        {features.map(f => (
          <div key={f.title} className="landing-feature-item">
            <span className="landing-feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
