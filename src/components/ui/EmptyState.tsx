import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { spacing } from '../../theme/spacing';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <AppText
        variant="title"
        color={theme.colors.text}
        align="center"
        style={styles.title}
      >
        {title}
      </AppText>
      {description && (
        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.description}
        >
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
          fullWidth={false}
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[8],
  },
  iconContainer: {
    marginBottom: spacing[4],
    opacity: 0.5,
  },
  title: {
    marginBottom: spacing[2],
  },
  description: {
    marginBottom: spacing[5],
    lineHeight: 22,
  },
  action: {
    marginTop: spacing[2],
    paddingHorizontal: spacing[6],
  },
});
