import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';

interface DividerProps {
  label?: string;
  style?: ViewStyle;
  thickness?: number;
  inset?: number;
}

export function Divider({ label, style, thickness = 1, inset = 0 }: DividerProps) {
  const theme = useAppTheme();

  if (label) {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={[styles.line, { backgroundColor: theme.colors.divider, height: thickness }]} />
        <AppText variant="caption" color={theme.colors.textMuted} style={styles.labelText}>
          {label}
        </AppText>
        <View style={[styles.line, { backgroundColor: theme.colors.divider, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: theme.colors.divider,
          marginHorizontal: inset,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
  },
  labelText: {
    flexShrink: 0,
  },
});
