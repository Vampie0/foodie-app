import { appColors, neutral, semantic } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { duration, spring } from './motion';
import { dimensions } from './dimensions';
import { componentTokens } from './componentTokens';
import { typographyVariants, fontFamily, fontSize, fontWeight } from './typography';

export interface RestaurantTheme {
  // Brand
  primary: string;
  primaryContainer: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;

  secondary: string;
  secondaryContainer: string;
  onSecondary: string;

  accent: string;

  // Background / Surface
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Border
  border: string;
  divider: string;

  // Status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Utility
  overlay: string;
  scrim: string;
  disabled: string;
}

export interface AppTheme {
  colors: RestaurantTheme;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  duration: typeof duration;
  spring: typeof spring;
  dimensions: typeof dimensions;
  componentTokens: typeof componentTokens;
  typography: typeof typographyVariants;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  isDark: boolean;
}

export function buildRestaurantTheme(
  primaryColor: string,
  isDark: boolean
): RestaurantTheme {
  const onPrimary = getContrastColor(primaryColor);
  const primaryLight = lighten(primaryColor, isDark ? 0.15 : 0.85);
  const primaryDark = darken(primaryColor, 0.15);
  const primaryContainer = lighten(primaryColor, isDark ? 0.12 : 0.92);

  return {
    primary: primaryColor,
    primaryContainer,
    primaryLight,
    primaryDark,
    onPrimary,

    secondary: isDark ? neutral[600] : neutral[200],
    secondaryContainer: isDark ? neutral[800] : neutral[100],
    onSecondary: isDark ? neutral[100] : neutral[900],

    accent: primaryColor,

    background: isDark ? appColors.backgroundDark : appColors.backgroundLight,
    surface: isDark ? appColors.surfaceDark : appColors.surfaceLight,
    surfaceElevated: isDark ? appColors.surfaceElevatedDark : appColors.surfaceElevatedLight,
    surfaceSubtle: isDark ? appColors.surfaceSubtleDark : appColors.surfaceSubtleLight,

    text: isDark ? appColors.textPrimaryDark : appColors.textPrimaryLight,
    textSecondary: isDark ? appColors.textSecondaryDark : appColors.textSecondaryLight,
    textMuted: isDark ? appColors.textMutedDark : appColors.textMutedLight,
    textInverse: isDark ? appColors.textInverseDark : appColors.textInverseLight,

    border: isDark ? appColors.borderDark : appColors.borderLight,
    divider: isDark ? appColors.dividerDark : appColors.dividerLight,

    success: semantic.success,
    successLight: semantic.successLight,
    warning: semantic.warning,
    warningLight: semantic.warningLight,
    error: semantic.error,
    errorLight: semantic.errorLight,
    info: semantic.info,
    infoLight: semantic.infoLight,

    overlay: appColors.overlay40,
    scrim: appColors.scrim,
    disabled: appColors.disabled,
  };
}

export function buildAppTheme(restaurantTheme: RestaurantTheme, isDark: boolean): AppTheme {
  return {
    colors: restaurantTheme,
    spacing,
    radius,
    shadows,
    duration,
    spring,
    dimensions,
    componentTokens,
    typography: typographyVariants,
    fontFamily,
    fontSize,
    fontWeight,
    isDark,
  };
}

// Default light theme (before restaurant is selected)
export const defaultLightTheme = buildRestaurantTheme('#FF6B35', false);
export const defaultDarkTheme = buildRestaurantTheme('#FF6B35', true);

// ─── Color utilities ────────────────────────────────────────────────────────

/** Parse hex color to RGB components */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/** Calculate relative luminance per WCAG */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns '#FFFFFF' or '#111111' based on best contrast */
export function getContrastColor(background: string): string {
  const rgb = hexToRgb(background);
  if (!rgb) return '#FFFFFF';
  const lum = relativeLuminance(rgb.r, rgb.g, rgb.b);
  // WCAG contrast ratio
  const whiteContrast = (1.0 + 0.05) / (lum + 0.05);
  const blackContrast = (lum + 0.05) / (0.0 + 0.05);
  return whiteContrast >= blackContrast ? '#FFFFFF' : '#111111';
}

/** Lighten a hex color toward white by `amount` (0–1) */
function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Darken a hex color toward black by `amount` (0–1) */
function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r * (1 - amount));
  const g = Math.round(rgb.g * (1 - amount));
  const b = Math.round(rgb.b * (1 - amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
