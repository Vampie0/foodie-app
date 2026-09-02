import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({ visible, message, transparent = false }: LoadingOverlayProps) {
  const theme = useAppTheme();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View
        style={[
          styles.overlay,
          { backgroundColor: transparent ? 'rgba(0,0,0,0.5)' : theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message && (
            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.message}
            >
              {message}
            </AppText>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    minWidth: 140,
  },
  message: {
    textAlign: 'center',
  },
});
