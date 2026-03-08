import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Hjem', icon: '⌂' },
  { path: '/gemte', label: 'Gemte beregninger', icon: '★' },
  { path: '/samlet-liste', label: 'Samlet materialeliste', icon: '☰' },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <button
          className={`burger-btn ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="header-logo">Tømrer Tools</Link>
        {!isHome && (
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Tilbage">
            ←
          </button>
        )}
      </header>

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}

      <nav className={`slide-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`slide-menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="slide-menu-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="app-main">{children}</main>
    </div>
  );
}
