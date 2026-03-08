const STORAGE_KEY = 'toemrer_tools_saved';
const MATLIST_KEY = 'toemrer_tools_matlist';

export function getSavedItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveItem(item) {
  const items = getSavedItems();
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    ...item
  };
  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
}

export function deleteItem(id) {
  const items = getSavedItems().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function duplicateItem(id) {
  const items = getSavedItems();
  const original = items.find(i => i.id === id);
  if (!original) return null;
  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    title: original.title + ' (kopi)'
  };
  items.unshift(copy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return copy;
}

export function getItemsByType(toolType) {
  return getSavedItems().filter(i => i.toolType === toolType);
}

// Combined material list
export function getMaterialList() {
  try {
    return JSON.parse(localStorage.getItem(MATLIST_KEY) || '[]');
  } catch { return []; }
}

export function addToMaterialList(items, source) {
  const list = getMaterialList();
  const newEntries = items.map(item => ({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    addedDate: new Date().toISOString(),
    source,
    ...item
  }));
  list.push(...newEntries);
  localStorage.setItem(MATLIST_KEY, JSON.stringify(list));
  return list;
}

export function removeMaterialListItem(id) {
  const list = getMaterialList().filter(i => i.id !== id);
  localStorage.setItem(MATLIST_KEY, JSON.stringify(list));
  return list;
}

export function clearMaterialList() {
  localStorage.setItem(MATLIST_KEY, '[]');
}

export function updateMaterialList(list) {
  localStorage.setItem(MATLIST_KEY, JSON.stringify(list));
}

// ─── Admin Settings ─────────────────────────────────────────
const ADMIN_KEY = 'toemrer_admin_settings';

export function getAdminSettings() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || '{}');
  } catch { return {}; }
}

export function updateAdminSettings(partial) {
  const current = getAdminSettings();
  const updated = { ...current, ...partial, lastUpdated: new Date().toISOString() };
  localStorage.setItem(ADMIN_KEY, JSON.stringify(updated));
  return updated;
}

export function resetAdminSettings() {
  localStorage.setItem(ADMIN_KEY, '{}');
  return {};
}

export function getAdminSeoOverride(path) {
  const settings = getAdminSettings();
  if (!settings.seoOverrides) return null;
  return settings.seoOverrides[path] || null;
}

export function getAdminSiteName() {
  const settings = getAdminSettings();
  return settings.siteName || '';
}

export function getAdminBaseUrl() {
  const settings = getAdminSettings();
  return settings.baseUrl || '';
}
