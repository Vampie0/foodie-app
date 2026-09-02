import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { spacing } from '../../theme/spacing';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  subtitle?: string;
}

export function SectionHeader({ title, actionLabel, onAction, style, subtitle }: SectionHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleGroup}>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="small" color={theme.colors.textMuted}>
            {subtitle}
          </AppText>
        )}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          accessible
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="label" color={theme.colors.primary} weight="600">
            {actionLabel}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
  },
  titleGroup: {
    gap: 2,
  },
});
