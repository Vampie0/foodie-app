import React from 'react';
import { View, ViewProps, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

type CardPadding = 'none' | 'small' | 'medium' | 'large';
type CardVariant = 'elevated' | 'outlined' | 'filled' | 'subtle';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: React.ReactNode;
}

interface PressableCardProps extends TouchableOpacityProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: React.ReactNode;
}

const paddingMap: Record<CardPadding, number> = {
  none: 0,
  small: spacing[3],
  medium: spacing[4],
  large: spacing[5],
};

function useCardStyle(variant: CardVariant, padding: CardPadding) {
  const theme = useAppTheme();

  const bgMap: Record<CardVariant, string> = {
    elevated: theme.colors.surface,
    outlined: theme.colors.surface,
    filled: theme.colors.surfaceSubtle,
    subtle: theme.colors.surfaceSubtle,
  };

  const shadowMap: Record<CardVariant, object> = {
    elevated: shadows.card,
    outlined: {},
    filled: {},
    subtle: {},
  };

  const borderMap: Record<CardVariant, { borderWidth?: number; borderColor?: string }> = {
    elevated: {},
    outlined: { borderWidth: 1, borderColor: theme.colors.border },
    filled: {},
    subtle: {},
  };

  return {
    backgroundColor: bgMap[variant],
    borderRadius: radius.lg,
    padding: paddingMap[padding],
    ...shadowMap[variant],
    ...borderMap[variant],
    overflow: 'hidden' as const,
  };
}

export function Card({ variant = 'elevated', padding = 'medium', children, style, ...rest }: CardProps) {
  const cardStyle = useCardStyle(variant, padding);
  return (
    <View style={[cardStyle, style]} {...rest}>
      {children}
    </View>
  );
}

export function PressableCard({
  variant = 'elevated',
  padding = 'medium',
  children,
  style,
  ...rest
}: PressableCardProps) {
  const cardStyle = useCardStyle(variant, padding);
  return (
    <TouchableOpacity
      style={[cardStyle, style]}
      activeOpacity={0.88}
      accessible
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}
