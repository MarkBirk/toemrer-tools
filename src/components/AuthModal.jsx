import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ onClose, initialMode = 'login' }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log ind
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Opret konto
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@email.dk"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Adgangskode</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Mindst 6 tegn' : 'Indtast adgangskode'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 12, width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Vent...' : mode === 'login' ? 'Log ind' : 'Opret konto'}
          </button>
        </form>

        <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: 8 }}>
          Annuller
        </button>
      </div>
    </>
  );
}
