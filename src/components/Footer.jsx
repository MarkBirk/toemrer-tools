import { Link } from 'react-router-dom';

const WoodGrainSVG = () => (
  <svg
    className="footer-grain"
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#8C6840" />
    <rect x="6" y="14" width="20" height="4" rx="2" fill="#1C1710" />
    <rect x="14" y="6" width="4" height="20" rx="2" fill="#1C1710" />
    <circle cx="16" cy="16" r="3" fill="#8C6840" />
  </svg>
);

const tools = [
  { name: 'Materialeberegner', path: '/materialeberegner' },
  { name: 'Taghældning', path: '/taghaeldning' },
  { name: 'Spærlængde', path: '/spaer-laengde' },
  { name: 'Tilbudsberegner', path: '/tilbudsberegner' },
  { name: 'Skæreplan', path: '/skaereplan' },
];

const resources = [
  { name: 'Standardmål', path: '/standardmaal' },
  { name: 'Bygge-regler', path: '/bygge-regler' },
  { name: 'Bygge-noter', path: '/bygge-noter' },
  { name: 'Gemte beregninger', path: '/gemte' },
];

export default function Footer() {

  return (
    <footer className="site-footer">
      <WoodGrainSVG />
      <div className="footer-topline" />

      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <Logo />
              <span className="footer-logo-text">
                Tømrer<span className="footer-logo-accent">Tools</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Præcise beregningsværktøjer bygget til det danske håndværk. Spar tid på pladsen og undgå dyre fejl.
            </p>
          </div>

          {/* Værktøjer */}
          <div className="footer-col">
            <h3 className="footer-heading">Værktøjer</h3>
            <ul className="footer-links">
              {tools.map((t) => (
                <li key={t.name}>
                  <Link to={t.path} className="footer-link">
                    <span className="footer-arrow">▸</span>
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressourcer */}
          <div className="footer-col">
            <h3 className="footer-heading">Ressourcer</h3>
            <ul className="footer-links">
              {resources.map((r) => (
                <li key={r.name}>
                  <Link to={r.path} className="footer-link">
                    <span className="footer-arrow">▸</span>
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} TømrerTools — Bygget med omtanke for danske håndværkere
          </p>
          <div className="footer-bottom-links">
            <Link to="/privatlivspolitik" className="footer-bottom-link">Privatlivspolitik</Link>
            <Link to="/kontakt" className="footer-bottom-link">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
