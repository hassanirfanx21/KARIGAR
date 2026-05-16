// ─── KARIGAR Design System ─────────────────────────────────────────────────────
// Single source of truth for all design tokens across the app.

export const Colors = {
  // Primary palette (Emerald Green)
  greenPrimary:  '#10B981',
  greenLight:    '#A7F3D0',
  greenMuted:    '#10B98120',
  greenOnDark:   '#34D399',

  // Grays (previously browns/charcoals)
  grayMatte:     '#F3F4F6', // Light gray replacing brownMatte
  grayLight:     '#E5E7EB',

  // Blacks
  blackDeep:     '#111827',
  blackMid:      '#374151',
  blackLight:    '#6B7280',

  // Whites
  whitePure:     '#FFFFFF',
  whiteSoft:     '#F9FAFB',

  // Dark mode surfaces
  darkBg:        '#111827',
  darkCard:      '#1F2937',
  darkBorder:    '#374151',

  // Borders
  border:        '#E5E7EB',
  borderLight:   '#F3F4F6',

  // Text
  textDark:      '#111827',
  textMedium:    '#4B5563',
  textMuted:     '#9CA3AF',
  textOnDark:    '#F9FAFB',

  // Status
  successGreen:  '#059669',
  errorRed:      '#EF4444',
  pendingOrange: '#F59E0B',
  inProgress:    '#10B981',

  // Status backgrounds
  confirmedBg:   'rgba(5,150,105,0.12)',
  confirmed:     '#059669',
  inProgressBg:  'rgba(16,185,129,0.12)',
  doneBg:        'rgba(5,150,105,0.08)',
  done:          '#059669',
  pendingBg:     'rgba(245,158,11,0.12)',
  pending:       '#F59E0B',
  cancelledBg:   'rgba(239,68,68,0.12)',
  successBg:     'rgba(5,150,105,0.12)',
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
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  greenFloat: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  darkHeader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 6,
  },
};
