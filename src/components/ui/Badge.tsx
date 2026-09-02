import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { radius } from '../../theme/radius';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'custom';
type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  customColor?: string;
  customTextColor?: string;
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  customColor,
  customTextColor,
  style,
  dot = false,
}: BadgeProps) {
  const theme = useAppTheme();

  const bgMap: Record<BadgeVariant, string> = {
    primary: theme.colors.primaryContainer,
    success: theme.colors.successLight,
    warning: theme.colors.warningLight,
    error: theme.colors.errorLight,
    info: theme.colors.infoLight,
    neutral: theme.colors.surfaceSubtle,
    custom: customColor ?? theme.colors.primaryContainer,
  };

  const textMap: Record<BadgeVariant, string> = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
    neutral: theme.colors.textSecondary,
    custom: customTextColor ?? theme.colors.primary,
  };

  const sizeStyle = size === 'small'
    ? { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs }
    : { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgMap[variant] },
        sizeStyle,
        style,
      ]}
      accessible
      accessibilityRole="text"
    >
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: textMap[variant] },
          ]}
        />
      )}
      <AppText
        variant="caption"
        color={textMap[variant]}
        weight="600"
        style={{ letterSpacing: 0.2 }}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
