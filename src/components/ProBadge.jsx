import { useState } from 'react';
import ProModal from './ProModal';

export default function ProBadge() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button className="pro-badge" onClick={() => setShowModal(true)} type="button">
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 5H8V3.5C8 1.84 6.66 0.5 5 0.5C3.34 0.5 2 1.84 2 3.5V5H1.5C0.95 5 0.5 5.45 0.5 6V10.5C0.5 11.05 0.95 11.5 1.5 11.5H8.5C9.05 11.5 9.5 11.05 9.5 10.5V6C9.5 5.45 9.05 5 8.5 5ZM5 9C4.45 9 4 8.55 4 8C4 7.45 4.45 7 5 7C5.55 7 6 7.45 6 8C6 8.55 5.55 9 5 9ZM6.7 5H3.3V3.5C3.3 2.56 4.06 1.8 5 1.8C5.94 1.8 6.7 2.56 6.7 3.5V5Z" fill="currentColor"/>
        </svg>
        <span>Pro</span>
      </button>
      {showModal && <ProModal onClose={() => setShowModal(false)} />}
    </>
  );
}
