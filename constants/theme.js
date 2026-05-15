// ─── KARIGAR Design System ─────────────────────────────────────────────────────
// Single source of truth for all design tokens across the app.
// Every screen imports from here — no more duplicated COLORS objects.

export const Colors = {
  // Primary palette
  goldPrimary:   '#C49A5A',
  goldLight:     '#E8D4AA',
  goldMuted:     '#C49A5A20',
  goldOnDark:    '#D4AF78',

  // Browns
  brownMatte:    '#5C3D2E',
  brownLight:    '#7A5A48',

  // Charcoals
  charcoalDeep:  '#1A1A1A',
  charcoalMid:   '#2A2A2A',
  charcoalLight: '#6B6B6B',

  // Whites
  whitePure:     '#FFFFFF',
  whiteSoft:     '#F7F3EE',

  // Dark mode surfaces
  darkBg:        '#141414',
  darkCard:      '#1E1E1E',
  darkBorder:    '#2E2E2E',

  // Borders
  border:        '#E0D8D0',
  borderLight:   '#E8E2D8',

  // Text
  textDark:      '#1A1A1A',
  textMedium:    '#4A4A4A',
  textMuted:     '#9E9E9E',
  textOnDark:    '#F0EDE8',

  // Status
  successGreen:  '#2E7D52',
  errorRed:      '#C0392B',
  pendingOrange: '#D4760A',
  inProgress:    '#C49A5A',

  // Status backgrounds
  confirmedBg:   'rgba(46,125,82,0.12)',
  confirmed:     '#2E7D52',
  inProgressBg:  'rgba(196,154,90,0.12)',
  doneBg:        'rgba(46,125,82,0.08)',
  done:          '#2E7D52',
  pendingBg:     'rgba(212,118,10,0.12)',
  pending:       '#D4760A',
  cancelledBg:   'rgba(192,57,43,0.12)',
  successBg:     'rgba(46,125,82,0.12)',
};

export const FontSize = {
  xs:      10,
  sm:      11,
  caption: 12,
  body:    13,
  bodyMd:  14,
  md:      16,
  lg:      17,
  xl:      20,
  xxl:     24,
  xxxl:    28,
  hero:    36,
};

export const FontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  heavy:    '800',
  black:    '900',
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const Radius = {
  xs:     8,
  sm:     10,
  md:     14,
  lg:     18,
  xl:     20,
  xxl:    24,
  full:   999,
  header: 28,
};

export const LetterSpacing = {
  tight: -0.3,
  normal: 0,
  wide:   0.5,
  caps:   1.5,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  goldFloat: {
    shadowColor: '#C49A5A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  darkHeader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
};
