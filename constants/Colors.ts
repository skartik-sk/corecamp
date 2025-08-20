/**
 * Camp Network Brand Colors
 * Below are the colors that maintain elegance and sophistication
 */

// Match corecamp-web Tailwind tokens for consistent branding between web & mobile
export const Colors = {
  // semantic tokens used by Themed* components
  light: {
    text: '#2B2B2B',
    background: '#F9F6F2',
    card: '#FFFFFF',
    border: '#D1D1D1',
    icon: '#2D5A66',
  // semantic tokens used by navigation/tab bar
  tint: '#FF6D01',
  tabIconDefault: '#d28888ff',
  },
  dark: {
    text: '#F9F6F2',
    background: '#2B2B2B',
    card: 'hsl(222.2 84% 4.9%)',
    border: '#374151',
    icon: '#A2D5D1',
  // semantic tokens used by navigation/tab bar in dark mode
  tint: '#FF6D01',
  tabIconDefault: '#A2D5D1',
  },
  // brand tokens (from tailwind.config.js)
  brand: {
  // kebab-case (original tokens)
  'camp-orange': '#FF6D01',
  'warm-1': '#FF9160',
  'cool-1': '#2D5A66',
  'warm-2': '#FFB400',
  'warm-3': '#FFC75F',
  'cool-2': '#6CA9B0',
  'cool-3': '#A2D5D1',
  'camp-light': '#F9F6F2',
  'camp-gray': '#D1D1D1',
  'camp-dark': '#2B2B2B',
  // camelCase aliases used across the codebase
  campOrange: '#FF6D01',
  warm1: '#FF9160',
  cool1: '#2D5A66',
  warm2: '#FFB400',
  warm3: '#FFC75F',
  cool2: '#6CA9B0',
  cool3: '#A2D5D1',
  light: '#F9F6F2',
  gray: '#D1D1D1',
  dark: '#2B2B2B',
  },
  // small palette for convenience
  camp: {
    orange: {
      500: '#FF6D01',
      600: '#EA580C',
    },
    blue: {
      500: '#3B82F6',
      600: '#2563EB',
    },
    red: {
  50: '#fee2e2',
  100: '#fecaca',
  500: '#EF4444',
  600: '#DC2626',
    },
    green: {
      500: '#22C55E',
      600: '#16A34A',
    },
    purple: {
      500: '#A855F7',
      600: '#9333EA',
    },
    gray: {
      500: '#D1D1D1',
    }
  },
  functional: {
    success: '#4ADE80',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // font family token (used by Themed components indirectly)
  fontFamily: {
  // Inter may not be checked in for mobile; fall back to SpaceMono (present in /assets/fonts)
  sans: 'SpaceMono-Regular',
  }
};
