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
  MATERIALELISTE_SAVED: 'toemrer_materialeliste_saved',
  TIDSREGISTRERING: 'toemrer_tidsregistrering',
  DOC_CHECKLISTS: 'toemrer_doc_checklists',
};

// ─── Named material lists ────────────────────────────────────
export function getSavedMaterialLists() {
  return getData(STORAGE_KEYS.MATERIALELISTE_SAVED, []);
}

export function saveMaterialList(name, list, grandTotal) {
  const all = getSavedMaterialLists();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    list,
    grandTotal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(entry);
  saveData(STORAGE_KEYS.MATERIALELISTE_SAVED, all);
  return entry;
}

export function updateSavedMaterialList(id, list, grandTotal) {
  const all = getSavedMaterialLists();
  const idx = all.findIndex(l => l.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], list, grandTotal, updatedAt: new Date().toISOString() };
  saveData(STORAGE_KEYS.MATERIALELISTE_SAVED, all);
  return all[idx];
}

export function deleteSavedMaterialList(id) {
  const all = getSavedMaterialLists().filter(l => l.id !== id);
  saveData(STORAGE_KEYS.MATERIALELISTE_SAVED, all);
}
