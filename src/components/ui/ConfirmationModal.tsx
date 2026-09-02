import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { Button } from './Button';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}: ConfirmationModalProps) {
  const theme = useAppTheme();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 20, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.9, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Animated.View
          style={[
            animStyle,
            styles.container,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Pressable>
            <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.title}>
              {title}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary} style={styles.message}>
              {message}
            </AppText>
            <View style={styles.actions}>
              <Button
                label={cancelLabel}
                onPress={onCancel}
                variant="ghost"
                size="medium"
                style={styles.cancelBtn}
              />
              <Button
                label={confirmLabel}
                onPress={onConfirm}
                variant={destructive ? 'danger' : 'primary'}
                size="medium"
                loading={loading}
                style={styles.confirmBtn}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    padding: spacing[5],
  },
  title: {
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[5],
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1.5,
  },
});
