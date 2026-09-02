import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { spacing } from '../../theme/spacing';
import { strings } from '../../constants/strings';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function ErrorState({
  title = strings.errors.generic,
  message = strings.errors.genericSubtitle,
  onRetry,
  style,
  icon,
}: ErrorStateProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <AppText
        variant="titleSmall"
        color={theme.colors.text}
        align="center"
        style={styles.title}
      >
        {title}
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textSecondary}
        align="center"
        style={styles.message}
      >
        {message}
      </AppText>
      {onRetry && (
        <Button
          label={strings.common.retry}
          onPress={onRetry}
          variant="outline"
          size="medium"
          fullWidth={false}
          style={styles.retryButton}
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
    opacity: 0.6,
  },
  title: {
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[5],
  },
  retryButton: {
    paddingHorizontal: spacing[6],
  },
});
