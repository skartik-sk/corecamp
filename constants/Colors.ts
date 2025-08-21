/**
 * CoreCamp Design System - Exact match to web app colors and design tokens
 * This color system matches the Tailwind config from corecamp-web exactly
 */

export const Colors = {
  // Core brand colors - exact match to web
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

  // Design system tokens - exact match to web
  primary: '#FF6D01',
  secondary: '#F0F0F0',
  background: '#FFFFFF',
  foreground: '#222222',
  muted: '#F0F0F0',
  'muted-foreground': '#6B7280',
  accent: '#F0F0F0',
  'accent-foreground': '#222222',
  destructive: '#DC2626',
  'destructive-foreground': '#FFFFFF',
  border: '#E5E7EB',
  input: '#E5E7EB',
  ring: '#222222',
  card: '#FFFFFF',
  'card-foreground': '#222222',

  // Light/Dark mode support
  light: {
    text: '#2B2B2B',
    background: '#FFFFFF',
    tint: '#FF6D01',
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FF6D01',
  },
  dark: {
    text: '#FFFFFF',
    background: '#111827',
    tint: '#FF6D01',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FF6D01',
  },

  // Brand shortcuts
  brand: {
    primary: '#FF6D01',
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
    // Also support kebab-case for consistency
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
  },

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Extended palette for components
  camp: {
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#FF6D01',
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    green: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Gradients (for LinearGradient usage)
  gradients: {
    primary: ['#FF6D01', '#FFB400', '#FF9160'],
    warm: ['#FF9160', '#FFB400'],
    cool: ['#2D5A66', '#6CA9B0'],
    glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.2)'],
    mesh: [
      'rgba(255, 109, 1, 0.1)',
      'rgba(255, 180, 0, 0.1)',
      'rgba(108, 169, 176, 0.1)'
    ],
  },

  // Typography
  fontFamily: {
    sans: 'Inter',
    fallback: 'SpaceMono-Regular',
  },
};
