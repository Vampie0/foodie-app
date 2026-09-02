import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { UI } from '../../constants/ui';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (toast: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const theme = useAppTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-80, { duration: 200 }, finished => {
        if (finished) runOnJS(onDismiss)();
      });
    }, toast.duration ?? UI.TOAST_AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const colorMap: Record<ToastType, string> = {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
    info: theme.colors.info,
  };

  const bgMap: Record<ToastType, string> = {
    success: theme.colors.successLight,
    error: theme.colors.errorLight,
    warning: theme.colors.warningLight,
    info: theme.colors.infoLight,
  };

  return (
    <Animated.View
      style={[
        animStyle,
        styles.toastItem,
        {
          backgroundColor: theme.colors.surface,
          borderLeftWidth: 3,
          borderLeftColor: colorMap[toast.type],
        },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${toast.type}: ${toast.title}${toast.message ? `. ${toast.message}` : ''}`}
    >
      <View style={styles.toastDot}>
        <View style={[styles.dot, { backgroundColor: colorMap[toast.type] }]} />
      </View>
      <View style={styles.toastContent}>
        <AppText variant="labelLarge" color={theme.colors.text} weight="600">
          {toast.title}
        </AppText>
        {toast.message && (
          <AppText variant="small" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
            {toast.message}
          </AppText>
        )}
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();
  const idRef = useRef(0);

  const show = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = String(++idRef.current);
    setToasts(prev => {
      // Max 3 toasts at once
      const next = [...prev.slice(-2), { ...toast, id }];
      return next;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    show({ type: 'success', title, message });
  }, [show]);

  const error = useCallback((title: string, message?: string) => {
    show({ type: 'error', title, message, duration: UI.TOAST_ERROR_DISMISS_MS });
  }, [show]);

  const info = useCallback((title: string, message?: string) => {
    show({ type: 'info', title, message });
  }, [show]);

  const warning = useCallback((title: string, message?: string) => {
    show({ type: 'warning', title, message });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning }}>
      {children}
      <View
        style={[
          styles.container,
          { top: (insets.top || 44) + 8 },
        ]}
        pointerEvents="none"
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  toastDot: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toastContent: {
    flex: 1,
  },
});
