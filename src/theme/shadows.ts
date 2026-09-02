import { Platform } from 'react-native';

type ShadowStyle = {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
};

const createShadow = (
  color: string,
  offsetY: number,
  opacity: number,
  blur: number,
  elevation: number
): ShadowStyle =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation },
    default: {},
  }) ?? {};

export const shadows = {
  none: {} as ShadowStyle,
  subtle: createShadow('#000000', 1, 0.04, 2, 1),
  card: createShadow('#000000', 2, 0.06, 6, 3),
  elevated: createShadow('#000000', 4, 0.10, 12, 6),
  modal: createShadow('#000000', 8, 0.16, 24, 12),
} as const;

export type ShadowKey = keyof typeof shadows;
