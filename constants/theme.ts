export const theme = {
  // Primary Palette
  primary: '#064E3B',
  primaryLight: '#0D7A5F',
  primaryDark: '#022C22',
  primarySurface: 'rgba(6,78,59,0.85)',

  // Gold Accent
  gold: '#D4AF37',
  goldLight: '#F0D060',
  goldDark: '#B8941E',
  goldGradient: ['#D4AF37', '#F0D060', '#D4AF37'] as const,

  // Backgrounds
  background: '#021A13',
  backgroundSecondary: '#032D21',
  surface: 'rgba(6,78,59,0.35)',
  surfaceGlass: 'rgba(6,78,59,0.25)',
  surfaceCard: 'rgba(255,255,255,0.06)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textGold: '#D4AF37',
  textMuted: 'rgba(255,255,255,0.4)',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  border: 'rgba(212,175,55,0.2)',
  borderLight: 'rgba(255,255,255,0.08)',

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Typography
  typography: {
    heroValue: { fontSize: 42, fontWeight: '800' as const, color: '#D4AF37' },
    heroLabel: { fontSize: 11, fontWeight: '700' as const, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '800' as const, color: '#FFFFFF' },
    cardTitle: { fontSize: 13, fontWeight: '700' as const, color: '#FFFFFF' },
    cardValue: { fontSize: 22, fontWeight: '800' as const, color: '#D4AF37' },
    body: { fontSize: 15, fontWeight: '500' as const, color: '#FFFFFF' },
    caption: { fontSize: 12, fontWeight: '500' as const, color: 'rgba(255,255,255,0.55)' },
    dhikrText: { fontSize: 28, fontWeight: '800' as const, color: '#FFFFFF', textAlign: 'center' as const },
    counterLarge: { fontSize: 56, fontWeight: '800' as const, color: '#D4AF37' },
    microText: { fontSize: 10, fontWeight: '600' as const, color: 'rgba(255,255,255,0.45)' },
  },

  // Shadows
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    glow: {
      shadowColor: '#D4AF37',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};
