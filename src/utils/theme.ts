export interface ThemeConfig {
  id: string;
  name: string;
  dotColor: string;
  vars: {
    '--accent-50': string;
    '--accent-100': string;
    '--accent-200': string;
    '--accent-300': string;
    '--accent-400': string;
    '--accent-500': string;
    '--accent-600': string;
    '--accent-700': string;
    '--accent-800': string;
    '--accent-900': string;
    '--accent-rgb': string;
    '--accent-glow': string;
    '--accent-grad-from': string;
    '--accent-grad-to': string;
  };
}

export const THEME_STORAGE_KEY = 'quizcraft_theme';

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'amber',
    name: 'Amber Gold',
    dotColor: '#f59e0b',
    vars: {
      '--accent-50': '#fffbeb',
      '--accent-100': '#fef3c7',
      '--accent-200': '#fde68a',
      '--accent-300': '#fcd34d',
      '--accent-400': '#fbbf24',
      '--accent-500': '#f59e0b',
      '--accent-600': '#d97706',
      '--accent-700': '#b45309',
      '--accent-800': '#92400e',
      '--accent-900': '#78350f',
      '--accent-rgb': '245, 158, 11',
      '--accent-glow': 'rgba(245, 158, 11, 0.35)',
      '--accent-grad-from': '#fcd34d',
      '--accent-grad-to': '#f97316',
    },
  },
  {
    id: 'blue',
    name: 'Cyber Blue',
    dotColor: '#3b82f6',
    vars: {
      '--accent-50': '#eff6ff',
      '--accent-100': '#dbeafe',
      '--accent-200': '#bfdbfe',
      '--accent-300': '#93c5fd',
      '--accent-400': '#60a5fa',
      '--accent-500': '#3b82f6',
      '--accent-600': '#2563eb',
      '--accent-700': '#1d4ed8',
      '--accent-800': '#1e40af',
      '--accent-900': '#1e3a8a',
      '--accent-rgb': '59, 130, 246',
      '--accent-glow': 'rgba(59, 130, 246, 0.35)',
      '--accent-grad-from': '#93c5fd',
      '--accent-grad-to': '#3b82f6',
    },
  },
  {
    id: 'purple',
    name: 'Electric Purple',
    dotColor: '#8b5cf6',
    vars: {
      '--accent-50': '#faf5ff',
      '--accent-100': '#f3e8ff',
      '--accent-200': '#e9d5ff',
      '--accent-300': '#d8b4fe',
      '--accent-400': '#c084fc',
      '--accent-500': '#8b5cf6',
      '--accent-600': '#7c3aed',
      '--accent-700': '#6d28d9',
      '--accent-800': '#5b21b6',
      '--accent-900': '#4c1d95',
      '--accent-rgb': '139, 92, 246',
      '--accent-glow': 'rgba(139, 92, 246, 0.35)',
      '--accent-grad-from': '#d8b4fe',
      '--accent-grad-to': '#a855f7',
    },
  },
  {
    id: 'emerald',
    name: 'Neon Mint',
    dotColor: '#10b981',
    vars: {
      '--accent-50': '#ecfdf5',
      '--accent-100': '#d1fae5',
      '--accent-200': '#a7f3d0',
      '--accent-300': '#6ee7b7',
      '--accent-400': '#34d399',
      '--accent-500': '#10b981',
      '--accent-600': '#059669',
      '--accent-700': '#047857',
      '--accent-800': '#065f46',
      '--accent-900': '#064e3b',
      '--accent-rgb': '16, 185, 129',
      '--accent-glow': 'rgba(16, 185, 129, 0.35)',
      '--accent-grad-from': '#6ee7b7',
      '--accent-grad-to': '#059669',
    },
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    dotColor: '#f43f5e',
    vars: {
      '--accent-50': '#fff1f2',
      '--accent-100': '#ffe4e6',
      '--accent-200': '#fecdd3',
      '--accent-300': '#fda4af',
      '--accent-400': '#fb7185',
      '--accent-500': '#f43f5e',
      '--accent-600': '#e11d48',
      '--accent-700': '#be123c',
      '--accent-800': '#9f1239',
      '--accent-900': '#881337',
      '--accent-rgb': '244, 63, 94',
      '--accent-glow': 'rgba(244, 63, 94, 0.35)',
      '--accent-grad-from': '#fda4af',
      '--accent-grad-to': '#e11d48',
    },
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    dotColor: '#06b6d4',
    vars: {
      '--accent-50': '#ecfeff',
      '--accent-100': '#cffafe',
      '--accent-200': '#a5f3fc',
      '--accent-300': '#67e8f9',
      '--accent-400': '#22d3ee',
      '--accent-500': '#06b6d4',
      '--accent-600': '#0891b2',
      '--accent-700': '#0e7490',
      '--accent-800': '#155e75',
      '--accent-900': '#164e63',
      '--accent-rgb': '6, 182, 212',
      '--accent-glow': 'rgba(6, 182, 212, 0.35)',
      '--accent-grad-from': '#67e8f9',
      '--accent-grad-to': '#0284c7',
    },
  },
];

export function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'amber';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && THEME_PRESETS.some((t) => t.id === stored)) {
      return stored;
    }
  } catch (err) {
    console.warn('[QuizCraft Theme] Failed to read theme from localStorage:', err);
  }
  return 'amber';
}

export function setStoredTheme(themeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (err) {
    console.error('[QuizCraft Theme] Failed to save theme to localStorage:', err);
  }
}

export function applyTheme(themeId: string): void {
  if (typeof document === 'undefined') return;
  const config = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const root = document.documentElement;

  Object.entries(config.vars).forEach(([cssVar, cssVal]) => {
    root.style.setProperty(cssVar, cssVal);
  });
}
