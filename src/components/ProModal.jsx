import { useAuth } from '../contexts/AuthContext';

export default function ProModal({ onClose, onOpenAuth }) {
  const { user } = useAuth();

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">
        <h3>Pro-funktion</h3>
        {user ? (
          <>
            <p>Denne funktion kræver en Pro-konto.</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Kontakt os for at opgradere til Pro.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 12, width: '100%' }}>
              Forstået
            </button>
          </>
        ) : (
          <>
            <p>Log ind eller opret en konto for at bruge denne funktion.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => { onClose(); onOpenAuth?.('login'); }}
            >
              Log ind
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginTop: 8, width: '100%' }}
              onClick={() => { onClose(); onOpenAuth?.('signup'); }}
            >
              Opret konto
            </button>
          </>
        )}
        <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: 8 }}>
          Annuller
        </button>
      </div>
    </>
  );
}
