// Vanta Gold — design tokens as JS constants.
// Use for anything CSS custom properties can't reach directly (canvas, charts, JS-driven animation).
// Never hardcode a hex value elsewhere in the app — import from here.

export const colors = {
  bgVoid: '#0A0A0C',
  bgSurface: '#121214',
  bgSurface2: '#1A1A1D',
  bgHairline: '#2A2A2E',

  goldBright: '#F4D68C',
  goldCore: '#D4AF37',
  goldDeep: '#A67C27',

  textPrimary: '#F5F1E8',
  textSecondary: '#A8A69E',
  textDisabled: '#5C5A54',

  stateSuccess: '#7FA88A',
  stateError: '#C46B5F',
  stateWarning: '#D4AF37',
};

export const goldMetalGradient =
  'linear-gradient(135deg, #F4D68C 0%, #D4AF37 45%, #A67C27 100%)';

export const fonts = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const radius = {
  sm: '6px',
  md: '12px',
  lg: '20px',
  full: '999px',
};

export const space = {
  1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48, 16: 64,
};

export const elevation = {
  1: '0 1px 2px rgba(0,0,0,0.4)',
  2: '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.05)',
  3: '0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.10)',
};

export const motion = {
  fast: 150,
  normal: 250,
};

/**
 * Composable-style helper for reduced-motion checks.
 * Use inside Vue components: const { reduced } = useMotionPreference()
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
