// ─── Islamabad Sector Geocoder ──────────────────────────────────────────────
// Hardcoded lat/lng for known Islamabad/Rawalpindi sectors.
// No Google Maps API key needed — works offline.

const SECTORS = {
  // Islamabad G-sectors
  'g-5':     { lat: 33.7260, lng: 73.0780, label: 'G-5, Islamabad' },
  'g-6':     { lat: 33.7190, lng: 73.0680, label: 'G-6, Islamabad' },
  'g-7':     { lat: 33.7120, lng: 73.0580, label: 'G-7, Islamabad' },
  'g-8':     { lat: 33.7050, lng: 73.0480, label: 'G-8, Islamabad' },
  'g-9':     { lat: 33.6930, lng: 73.0410, label: 'G-9, Islamabad' },
  'g-10':    { lat: 33.6820, lng: 73.0340, label: 'G-10, Islamabad' },
  'g-11':    { lat: 33.6700, lng: 73.0280, label: 'G-11, Islamabad' },
  'g-13':    { lat: 33.6310, lng: 73.0140, label: 'G-13, Islamabad' },
  'g-14':    { lat: 33.6150, lng: 73.0050, label: 'G-14, Islamabad' },
  'g-15':    { lat: 33.6000, lng: 72.9950, label: 'G-15, Islamabad' },

  // Islamabad F-sectors
  'f-6':     { lat: 33.7280, lng: 73.0680, label: 'F-6, Islamabad' },
  'f-7':     { lat: 33.7200, lng: 73.0560, label: 'F-7, Islamabad' },
  'f-8':     { lat: 33.7070, lng: 73.0450, label: 'F-8, Islamabad' },
  'f-10':    { lat: 33.6920, lng: 73.0250, label: 'F-10, Islamabad' },
  'f-11':    { lat: 33.6800, lng: 73.0150, label: 'F-11, Islamabad' },

  // Islamabad I-sectors
  'i-8':     { lat: 33.6840, lng: 73.0770, label: 'I-8, Islamabad' },
  'i-9':     { lat: 33.6720, lng: 73.0700, label: 'I-9, Islamabad' },
  'i-10':    { lat: 33.6650, lng: 73.0600, label: 'I-10, Islamabad' },
  'i-11':    { lat: 33.6580, lng: 73.0530, label: 'I-11, Islamabad' },

  // Islamabad E-sectors
  'e-7':     { lat: 33.7310, lng: 73.0650, label: 'E-7, Islamabad' },
  'e-11':    { lat: 33.6850, lng: 73.0230, label: 'E-11, Islamabad' },

  // Blue Area & major landmarks
  'blue area':   { lat: 33.7100, lng: 73.0580, label: 'Blue Area, Islamabad' },
  'jinnah super': { lat: 33.7110, lng: 73.0570, label: 'Jinnah Super, Islamabad' },

  // Rawalpindi
  'saddar':        { lat: 33.5970, lng: 73.0480, label: 'Saddar, Rawalpindi' },
  'satellite town': { lat: 33.6180, lng: 73.0520, label: 'Satellite Town, Rawalpindi' },
  'bahria town':   { lat: 33.5170, lng: 73.0960, label: 'Bahria Town, Rawalpindi' },

  // DHA
  'dha':           { lat: 33.5210, lng: 73.1100, label: 'DHA, Islamabad' },
  'dha phase 1':   { lat: 33.5280, lng: 73.1050, label: 'DHA Phase 1, Islamabad' },
  'dha phase 2':   { lat: 33.5210, lng: 73.1100, label: 'DHA Phase 2, Islamabad' },
  'dha phase 5':   { lat: 33.5150, lng: 73.1200, label: 'DHA Phase 5, Islamabad' },

  // PWD, Gulberg, etc
  'pwd':           { lat: 33.5680, lng: 73.0780, label: 'PWD, Islamabad' },
  'gulberg':       { lat: 33.5560, lng: 73.0680, label: 'Gulberg Greens, Islamabad' },
};

/**
 * Resolve a location string to lat/lng.
 * Handles case-insensitive matching, partial matches, and common variations.
 *
 * @param {string} locationRaw - e.g. "G-13", "g13", "DHA Phase 2", "bahria"
 * @returns {{ lat: number, lng: number, label: string } | null}
 */
function geocode(locationRaw) {
  if (!locationRaw) return null;

  // Normalize: lowercase, trim, remove extra spaces
  let key = locationRaw.toLowerCase().trim().replace(/\s+/g, ' ');

  // Direct match
  if (SECTORS[key]) return SECTORS[key];

  // Try adding a dash (g13 → g-13)
  const dashVariant = key.replace(/([a-z])(\d)/, '$1-$2');
  if (SECTORS[dashVariant]) return SECTORS[dashVariant];

  // Partial match: find the first sector key that contains the input
  for (const [sectorKey, value] of Object.entries(SECTORS)) {
    if (sectorKey.includes(key) || key.includes(sectorKey)) {
      return value;
    }
  }

  // No match — return a default (center of Islamabad)
  return { lat: 33.6844, lng: 73.0479, label: `${locationRaw} (approximate)` };
}

/**
 * Get all sector names (for display purposes).
 */
function getAllSectors() {
  return Object.entries(SECTORS).map(([key, val]) => ({
    key,
    ...val,
  }));
}

module.exports = { geocode, getAllSectors, SECTORS };
