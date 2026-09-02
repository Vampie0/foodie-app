import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Share,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { useOrder } from '../../../queries/orderQueries';
import { useToast } from '../../../components/ui/Toast';
import { formatPrice } from '../../../components/ui/Price';
import { getStatusLabel } from '../../../utils/orderStateMachine';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();

  const { data: order } = useOrder(orderId);

  // Animations
  const checkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkScale.value = withSpring(1, { damping: 14, stiffness: 200 });
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    contentTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 180 }));
  }, []);

  // Prevent back navigation to checkout
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleCopyOrderNumber = () => {
    if (!order) return;
    toast.success('Copied!', `Order #${order.orderNumber}`);
  };

  const handleShare = async () => {
    if (!order) return;
    try {
      await Share.share({
        message: `I just placed an order at ${order.restaurantName}! Order #${order.orderNumber}`,
      });
    } catch {
      // User cancelled share
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Success icon */}
        <Animated.View style={[checkStyle, styles.successCircle, { backgroundColor: theme.colors.successLight }]}>
          <AppText style={styles.checkIcon}>✓</AppText>
        </Animated.View>

        <Animated.View style={[contentStyle, styles.textSection]}>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700" align="center">
            Order Placed!
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} align="center" style={styles.subtitle}>
            We've received your order and the restaurant is preparing it
          </AppText>

          {order && (
            <View style={[styles.orderBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <AppText variant="small" color={theme.colors.textMuted} align="center">
                Your order number
              </AppText>
              <TouchableOpacity
                onPress={handleCopyOrderNumber}
                style={styles.orderNumberRow}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Order number ${order.orderNumber}. Tap to copy`}
              >
                <AppText variant="titleSmall" color={theme.colors.primary} weight="700">
                  #{order.orderNumber}
                </AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>  📋 Copy</AppText>
              </TouchableOpacity>

              {order.estimatedDeliveryTime && (
                <View style={styles.etaRow}>
                  <AppText style={{ fontSize: 16 }}>⏱</AppText>
                  <AppText variant="body" color={theme.colors.text} weight="500">
                    {order.estimatedDeliveryTime}
                  </AppText>
                </View>
              )}

              <View style={[styles.statusBadgeRow, { backgroundColor: theme.colors.infoLight }]}>
                <AppText style={{ fontSize: 14 }}>📦</AppText>
                <AppText variant="label" color={theme.colors.info} weight="600">
                  {getStatusLabel(order.status)}
                </AppText>
              </View>

              <AppText variant="caption" color={theme.colors.textMuted} align="center">
                Total: {formatPrice(order.total, 'PKR')}
              </AppText>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Actions */}
      <Animated.View style={[contentStyle, styles.actions, { paddingBottom: insets.bottom + spacing[4] }]}>
        {order && (
          <Button
            label="Track Order"
            variant="primary"
            size="large"
            onPress={() => {
              router.replace(`/(app)/orders/${order.id}`);
            }}
          />
        )}
        <Button
          label="Back to Home"
          variant="outline"
          size="large"
          onPress={() => router.replace('/(app)/(tabs)')}
        />
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareBtn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Share order"
        >
          <AppText variant="label" color={theme.colors.textMuted}>Share order  🔗</AppText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[5],
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 44,
    color: '#22C55E',
    lineHeight: 52,
  },
  textSection: {
    alignItems: 'center',
    gap: spacing[3],
  },
  subtitle: {
    lineHeight: 24,
    maxWidth: 300,
  },
  orderBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing[5],
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },
  actions: {
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  shareBtn: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
});
