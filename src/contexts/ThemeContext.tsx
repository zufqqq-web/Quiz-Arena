import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { THEME_PRESETS, ThemeConfig, getStoredTheme, setStoredTheme, applyTheme } from '../utils/theme';

interface ThemeContextType {
  theme: string;
  setTheme: (themeId: string) => void;
  currentTheme: ThemeConfig;
  presets: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'amber',
  setTheme: () => {},
  currentTheme: THEME_PRESETS[0],
  presets: THEME_PRESETS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (themeId: string) => {
    setThemeState(themeId);
    setStoredTheme(themeId);
    applyTheme(themeId);
  };

  const currentTheme = useMemo(() => {
    return THEME_PRESETS.find((t) => t.id === theme) || THEME_PRESETS[0];
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      currentTheme,
      presets: THEME_PRESETS,
    }),
    [theme, currentTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
