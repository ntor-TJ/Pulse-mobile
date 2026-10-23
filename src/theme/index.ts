export const colors = {
  // Brand Primary (Axiora Orange)
  primary: '#FF4500',
  primaryHover: '#E03E00',
  primaryLight: '#FF6A27',
  primaryMuted: '#FFF0EB',
  primarySoft: 'rgba(255, 69, 0, 0.12)',

  // Accent & Brand Gradient
  brandGradient: ['#FF4500', '#FF7537', '#FFA94D'] as const,
  brandGradientDark: ['#E03E00', '#FF4500', '#FF7537'] as const,

  // Surfaces & Backgrounds - Light Mode
  light: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surface2: '#F8FAFC',
    surfaceHover: '#F1F5F9',
    surfaceCard: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    overlay: 'rgba(15, 23, 42, 0.6)',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
  },

  // Surfaces & Backgrounds - Dark Mode
  dark: {
    bg: '#0B0F17',
    surface: '#111827',
    surface2: '#1E293B',
    surfaceHover: '#334155',
    surfaceCard: '#161F30',
    border: '#1E293B',
    borderLight: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    overlay: 'rgba(0, 0, 0, 0.8)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },

  // Semantics & Statuses
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
