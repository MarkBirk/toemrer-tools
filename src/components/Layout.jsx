import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Hjem', icon: '⌂' },
  { path: '/gemte', label: 'Gemte beregninger', icon: '★' },
  { path: '/materialeliste', label: 'Materialelister', icon: '☰' },
  { path: '/tidsregistrering', label: 'Tidsregistrering', icon: '⏱' },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(null); // null | 'login' | 'signup'
  const { user, loading, signOut } = useAuth();
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
        <Link to="/" className="header-logo">HåndværkerTools</Link>
        <div className="header-auth-buttons">
          {loading ? null : user ? (
            <>
              <span className="header-user-email">{user.email}</span>
              <button className="btn btn-sm btn-ghost header-auth-btn" onClick={signOut}>
                Log ud
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-ghost header-auth-btn" onClick={() => setShowAuth('login')}>
                Log ind
              </button>
              <button className="btn btn-sm btn-primary header-auth-btn" onClick={() => setShowAuth('signup')}>
                Opret konto
              </button>
            </>
          )}
        </div>
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
        <Link
          to="/vaerktoejer"
          className={`slide-menu-item ${location.pathname === '/vaerktoejer' ? 'active' : ''}`}
        >
          <span className="slide-menu-icon">▦</span>
          Alle værktøjer
        </Link>
      </nav>

      <main className="app-main">{children}</main>
      <Footer />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(null)}
          initialMode={showAuth}
        />
      )}
    </div>
  );
}
