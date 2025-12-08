// Battlefront 2 themed colors - Default theme (used until user-specific theme is loaded)
export const defaultTheme = {
  colors: {
    bg: '#0a0b0d',
    background: '#0a0b0d',
    backgroundSecondary: 'rgba(255, 176, 0, 0.1)',
    surface: '#141619',
    card: 'rgba(255, 176, 0, 0.05)',
    border: '#ffb000',
    primary: '#ffb000',
    onPrimary: '#0a0b0d',
    onSurface: '#ffffff',
    text: '#ffffff',
    textSecondary: '#ffd966',
    accent: '#ffcc33',
    muted: '#996600',
  glow: '#cc6600',
  pink: '#ff69b4'
  },
  typography: {
    h1: 32, h2: 24, h3: 20, body: 16, caption: 14
  }
};

// Helper to merge remote theme safely
export function mergeTheme(remote = {}) {
  return {
    ...defaultTheme,
    ...remote,
    colors: { ...defaultTheme.colors, ...(remote.colors || {}) },
    typography: { ...defaultTheme.typography, ...(remote.typography || {}) }
  };
}