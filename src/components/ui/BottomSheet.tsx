import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: string[];
  children?: React.ReactNode;
  showHandle?: boolean;
  scrollable?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  scrollable = false,
}: BottomSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 200, mass: 0.8 });
      overlayOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            sheetStyle,
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + spacing[4],
            },
          ]}
          accessible
          accessibilityViewIsModal
          accessibilityLabel={title ? `${title} panel` : 'Bottom sheet panel'}
        >
          {showHandle && (
            <View style={styles.handleArea}>
              <View
                style={[styles.handle, { backgroundColor: theme.colors.border }]}
              />
            </View>
          )}

          {title && (
            <View style={styles.titleRow}>
              <AppText variant="titleSmall" color={theme.colors.text} weight="600">
                {title}
              </AppText>
            </View>
          )}

          <ContentWrapper
            style={scrollable ? styles.scrollContent : styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ContentWrapper>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  sheet: {
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
    paddingTop: spacing[1],
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
  },
});
