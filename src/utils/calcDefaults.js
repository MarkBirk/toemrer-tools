import { getAdminSettings } from './storage';

// Hardcoded fallback defaults — used when admin hasn't overridden a value
export const CALC_DEFAULTS = {
  terrasse: {
    boardWidth: 145,    // mm
    boardGap: 5,        // mm
    joistSpacing: 600,  // mm c/c
    waste: 10,          // %
  },
  vaeg: {
    wallHeight: 2.4,    // m
    studSpacing: 600,   // mm c/c
    plateWidth: 1200,   // mm
    plateHeight: 2400,  // mm
    screwsPerM2: 15,    // stk pr. m²
  },
  isolering: {
    packageCoverage: 3.42, // m² pr. pakke
    waste: 5,              // %
  },
  tilbud: {
    timepris: 450,      // kr.
    avancePct: 15,       // %
    momsPct: 25,         // %
  },
  skruer: {
    boardWidth: 145,        // mm
    joistSpacing: 600,      // mm c/c
    screwsPerCrossing: 2,   // stk
    boardGap: 5,            // mm
    screwsPerM2: 15,        // gips skruer pr. m²
  },
  skaereplan: {
    raaLaengde: 4800,  // mm
    snitBredde: 3,     // mm
  },
  densiteter: {
    'Fyrretræ': 500,
    'Egetræ': 700,
    'Gran': 450,
    'MDF': 750,
    'Krydsfiner': 600,
    'OSB': 620,
    'Gips': 850,
    'Beton': 2400,
    'Stål': 7850,
  },
};

/**
 * Returns merged calc defaults: hardcoded fallbacks + admin overrides.
 * Admin overrides are stored under adminSettings.calcDefaults.
 */
export function getCalcDefaults() {
  const admin = getAdminSettings();
  const overrides = admin.calcDefaults || {};

  const merged = {};
  for (const section of Object.keys(CALC_DEFAULTS)) {
    if (typeof CALC_DEFAULTS[section] === 'object') {
      merged[section] = { ...CALC_DEFAULTS[section], ...(overrides[section] || {}) };
    } else {
      merged[section] = overrides[section] ?? CALC_DEFAULTS[section];
    }
  }
  return merged;
}
