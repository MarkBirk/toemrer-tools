// Pro-status synkroniseres fra AuthContext
let _proFromAuth = null;

export const setProFromAuth = (isPro) => { _proFromAuth = isPro; };

export const isPro = () => {
  if (_proFromAuth !== null) return _proFromAuth;
  return localStorage.getItem('pro') === 'true'; // fallback
};

export const PRO_FEATURES = [
  'pdf_export',
  'saved_projects',
  'quote_history',
  'multi_user',
];

export const isFeatureLocked = (feature) => {
  if (isPro()) return false;
  return PRO_FEATURES.includes(feature);
};
