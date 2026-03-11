// Generic localStorage abstraction for cross-tool data sharing

export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('saveData failed:', e);
  }
}

export function getData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function deleteData(key) {
  localStorage.removeItem(key);
}

// Storage keys used across tools
export const STORAGE_KEYS = {
  MATERIALELISTE_DRAFT: 'toemrer_materialeliste_draft',
  TIDSREGISTRERING: 'toemrer_tidsregistrering',
  DOC_CHECKLISTS: 'toemrer_doc_checklists',
};
