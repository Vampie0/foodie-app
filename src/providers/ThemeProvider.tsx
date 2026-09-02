import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  AppTheme,
  RestaurantTheme,
  buildAppTheme,
  buildRestaurantTheme,
  defaultLightTheme,
  defaultDarkTheme,
} from '../theme/theme';

interface ThemeContextValue {
  theme: AppTheme;
  restaurantTheme: RestaurantTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  primaryColor?: string;
  colorSchemeOverride?: 'light' | 'dark' | 'system';
}

export function ThemeProvider({
  children,
  primaryColor = '#FF6B35',
  colorSchemeOverride = 'system',
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (colorSchemeOverride === 'light') return false;
    if (colorSchemeOverride === 'dark') return true;
    return systemScheme === 'dark';
  }, [colorSchemeOverride, systemScheme]);

  const restaurantTheme = useMemo(
    () => buildRestaurantTheme(primaryColor, isDark),
    [primaryColor, isDark]
  );

  const theme = useMemo(
    () => buildAppTheme(restaurantTheme, isDark),
    [restaurantTheme, isDark]
  );

  const value = useMemo(
    () => ({ theme, restaurantTheme, isDark }),
    [theme, restaurantTheme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx.theme;
}

export function useRestaurantTheme(): RestaurantTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useRestaurantTheme must be used within ThemeProvider');
  return ctx.restaurantTheme;
}

export function useIsDark(): boolean {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useIsDark must be used within ThemeProvider');
  return ctx.isDark;
}

// Convenience default exports
export { defaultLightTheme, defaultDarkTheme };
