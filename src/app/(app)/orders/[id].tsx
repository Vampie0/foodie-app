import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { ErrorState } from '../../../components/ui/ErrorState';
import { AppImage } from '../../../components/ui/AppImage';
import { useToast } from '../../../components/ui/Toast';
import { useOrder } from '../../../queries/orderQueries';
import { queryClient } from '../../../providers/QueryProvider';
import { queryKeys } from '../../../queries/queryKeys';
import { ordersApi } from '../../../api/orders';
import { formatPrice } from '../../../components/ui/Price';
import { normalizeError } from '../../../utils/error';
import { usePreventDoubleTap } from '../../../hooks/usePreventDoubleTap';
import {
  getStatusLabel,
  getStatusDescription,
  isCancellable,
  isActiveOrder,
  getOrderProgress,
} from '../../../utils/orderStateMachine';
import {
  OrderStatus,
  CANCELLATION_REASONS,
} from '../../../types/order';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

function OrderTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const theme = useAppTheme();
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <View style={[styles.timelineContainer, { backgroundColor: theme.colors.errorLight }]}>
        <AppText style={{ fontSize: 24 }}>✕</AppText>
        <View style={styles.timelineText}>
          <AppText variant="labelLarge" color={theme.colors.error} weight="600">Order Cancelled</AppText>
          <AppText variant="small" color={theme.colors.error}>This order has been cancelled</AppText>
        </View>
      </View>
    );
  }

  const progress = getOrderProgress(currentStatus);

  return (
    <View style={styles.timeline}>
      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${progress * 100}%` }]} />
      </View>

      {STATUS_FLOW.map((status, i) => {
        const stepIndex = STATUS_FLOW.indexOf(currentStatus);
        const isDone = i <= stepIndex;
        const isCurrent = i === stepIndex;

        return (
          <View key={status} style={styles.timelineStep}>
            <View style={[
              styles.stepDot,
              {
                backgroundColor: isDone ? theme.colors.primary : theme.colors.border,
                width: isCurrent ? 16 : 12,
                height: isCurrent ? 16 : 12,
                borderRadius: isCurrent ? 8 : 6,
              },
            ]}>
              {isCurrent && (
                <View style={[styles.stepDotInner, { backgroundColor: theme.colors.onPrimary }]} />
              )}
            </View>
            <View style={styles.stepInfo}>
              <AppText
                variant={isCurrent ? 'labelLarge' : 'label'}
                color={isDone ? theme.colors.text : theme.colors.textMuted}
                weight={isCurrent ? '700' : '400'}
              >
                {getStatusLabel(status)}
              </AppText>
              {isCurrent && (
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {getStatusDescription(status)}
                </AppText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();

  const { data: order, isLoading, isError, refetch } = useOrder(id);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRateSheet, setShowRateSheet] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const doCancel = useCallback(async () => {
    if (!order || !cancelReason) return;
    setIsCancelling(true);
    try {
      await ordersApi.cancelOrder(order.id, cancelReason, cancelNote || undefined);
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(order.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
      setShowCancelModal(false);
      toast.success('Order cancelled', 'Your order has been cancelled');
    } catch (err) {
      toast.error('Cannot cancel', normalizeError(err).userMessage);
    } finally {
      setIsCancelling(false);
    }
  }, [order, cancelReason, cancelNote, toast]);

  const handleCancel = usePreventDoubleTap(doCancel, 3000);

  const handleSubmitRating = useCallback(async () => {
    if (!order || rating === 0) return;
    setIsSubmittingRating(true);
    try {
      await ordersApi.rateOrder(order.id, rating, review || undefined);
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(order.id) });
      setShowRateSheet(false);
      toast.success('Thanks for your review!');
    } catch (err) {
      toast.error('Failed to submit', normalizeError(err).userMessage);
    } finally {
      setIsSubmittingRating(false);
    }
  }, [order, rating, review, toast]);

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <ErrorState
        title="Order not found"
        message="This order may no longer exist"
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider, backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <AppText variant="titleSmall" color={theme.colors.text} weight="600">Order Details</AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>#{order.orderNumber}</AppText>
        </View>
        <Badge label={getStatusLabel(order.status)} variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'} size="small" />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing[8] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant info */}
        <Card variant="elevated" padding="medium" style={styles.restaurantCard}>
          <View style={styles.restaurantRow}>
            <AppImage source={{ uri: order.restaurantLogo }} width={48} height={48} borderRadius={radius.lg} style={{ width: 48, height: 48 }} />
            <View style={styles.restaurantInfo}>
              <AppText variant="titleSmall" color={theme.colors.text} weight="600">{order.restaurantName}</AppText>
              <AppText variant="small" color={theme.colors.textMuted}>
                {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Status timeline */}
        <Card variant="elevated" padding="medium">
          <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.cardTitle}>
            Order Status
          </AppText>
          <OrderTimeline currentStatus={order.status} />
          {isActiveOrder(order.status) && order.estimatedDeliveryTime && (
            <View style={[styles.etaBanner, { backgroundColor: theme.colors.infoLight }]}>
              <AppText style={{ fontSize: 16 }}>⏱</AppText>
              <AppText variant="label" color={theme.colors.info} weight="600">
                Estimated: {order.estimatedDeliveryTime}
              </AppText>
            </View>
          )}
        </Card>

        {/* Items */}
        <Card variant="elevated" padding="medium">
          <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.cardTitle}>
            Items Ordered
          </AppText>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <AppText variant="body" color={theme.colors.textMuted} style={{ minWidth: 24 }}>{item.quantity}×</AppText>
              <View style={styles.itemInfo}>
                <AppText variant="body" color={theme.colors.text} weight="500">{item.name}</AppText>
                {item.selectedVariants.length > 0 && (
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    {item.selectedVariants.map(v => v.variantName).join(' · ')}
                  </AppText>
                )}
                {item.selectedAddOns.length > 0 && (
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    + {item.selectedAddOns.map(a => a.addOnName).join(', ')}
                  </AppText>
                )}
              </View>
              <AppText variant="body" color={theme.colors.text} weight="500">
                {formatPrice(item.totalPrice, 'PKR')}
              </AppText>
            </View>
          ))}

          <Divider style={{ marginVertical: spacing[3] }} />

          {[
            { label: 'Subtotal', value: formatPrice(order.subtotal, 'PKR') },
            { label: `Tax (${Math.round(order.taxRate * 100)}%)`, value: formatPrice(order.taxAmount, 'PKR') },
            { label: 'Delivery fee', value: formatPrice(order.deliveryFee, 'PKR') },
            ...(order.discountAmount > 0 ? [{ label: 'Discount', value: `-${formatPrice(order.discountAmount, 'PKR')}`, color: theme.colors.success }] : []),
          ].map(row => (
            <View key={row.label} style={styles.priceRow}>
              <AppText variant="body" color={theme.colors.textSecondary}>{row.label}</AppText>
              <AppText variant="body" color={(row as { color?: string }).color ?? theme.colors.text}>{row.value}</AppText>
            </View>
          ))}

          <Divider style={{ marginVertical: spacing[2] }} />
          <View style={styles.priceRow}>
            <AppText variant="titleSmall" color={theme.colors.text} weight="700">Total</AppText>
            <AppText variant="titleSmall" color={theme.colors.primary} weight="700">{formatPrice(order.total, 'PKR')}</AppText>
          </View>
        </Card>

        {/* Delivery address */}
        {order.deliveryAddress && (
          <Card variant="elevated" padding="medium">
            <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.cardTitle}>
              Delivery Address
            </AppText>
            <View style={styles.addressRow}>
              <AppText style={{ fontSize: 22 }}>
                {order.deliveryAddress.label === 'home' ? '🏠' : order.deliveryAddress.label === 'work' ? '🏢' : '📍'}
              </AppText>
              <View style={{ flex: 1 }}>
                <AppText variant="labelLarge" color={theme.colors.text} weight="600" style={{ textTransform: 'capitalize' }}>
                  {order.deliveryAddress.label}
                </AppText>
                <AppText variant="small" color={theme.colors.textSecondary}>
                  {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}
                </AppText>
              </View>
            </View>
          </Card>
        )}

        {/* Payment info */}
        <Card variant="elevated" padding="medium">
          <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.cardTitle}>
            Payment
          </AppText>
          <View style={styles.paymentRow}>
            <AppText style={{ fontSize: 20 }}>
              {order.paymentMethod === 'cash' ? '💵' : order.paymentMethod === 'card' ? '💳' : '📱'}
            </AppText>
            <AppText variant="body" color={theme.colors.text} style={{ flex: 1, textTransform: 'capitalize' }}>
              {order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Card' : 'Digital Wallet'}
            </AppText>
            <Badge
              label={order.paymentStatus}
              variant={order.paymentStatus === 'paid' ? 'success' : 'neutral'}
              size="small"
            />
          </View>
        </Card>

        {/* Rating card — show after delivered and not yet rated */}
        {order.status === 'delivered' && !order.isRated && (
          <Card variant="elevated" padding="medium" style={{ backgroundColor: theme.colors.primaryContainer }}>
            <AppText variant="titleSmall" color={theme.colors.primary} weight="600" style={styles.cardTitle}>
              Rate Your Order
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary} style={{ marginBottom: spacing[3] }}>
              How was your experience with {order.restaurantName}?
            </AppText>
            <Button
              label="Leave a Review"
              variant="primary"
              size="medium"
              onPress={() => setShowRateSheet(true)}
            />
          </Card>
        )}

        {order.isRated && order.rating && (
          <Card variant="elevated" padding="medium">
            <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.cardTitle}>
              Your Review
            </AppText>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <AppText key={s} style={{ fontSize: 22 }}>{s <= order.rating! ? '⭐' : '☆'}</AppText>
              ))}
            </View>
            {order.review && (
              <AppText variant="body" color={theme.colors.textSecondary} style={{ fontStyle: 'italic', marginTop: spacing[2] }}>
                "{order.review}"
              </AppText>
            )}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {isCancellable(order.status) && (
            <Button
              label="Cancel Order"
              variant="outline"
              size="medium"
              onPress={() => setShowCancelModal(true)}
            />
          )}
          {order.status === 'delivered' && (
            <Button
              label="Reorder"
              variant="primary"
              size="medium"
              onPress={() => router.push('/(app)/(tabs)')}
            />
          )}
        </View>
      </ScrollView>

      {/* Cancel confirmation */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order?"
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Order"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
        destructive
        loading={isCancelling}
      />

      {/* Rating sheet */}
      <BottomSheet
        visible={showRateSheet}
        onClose={() => setShowRateSheet(false)}
        title="Rate Your Order"
        scrollable
      >
        <View style={styles.ratingContent}>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            How was your experience?
          </AppText>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setRating(s)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${s} star${s > 1 ? 's' : ''}`}
                accessibilityState={{ selected: rating >= s }}
              >
                <AppText style={styles.ratingStar}>{s <= rating ? '⭐' : '☆'}</AppText>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={review}
            onChangeText={t => setReview(t.slice(0, 500))}
            placeholder="Share your experience... (optional)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            style={[styles.reviewInput, { color: theme.colors.text, backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border }]}
            accessibilityLabel="Write a review"
          />
          <AppText variant="caption" color={theme.colors.textMuted} align="right">{review.length}/500</AppText>

          <Button
            label="Submit Review"
            variant="primary"
            size="large"
            disabled={rating === 0}
            loading={isSubmittingRating}
            onPress={handleSubmitRating}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  scrollContent: { padding: spacing[4], gap: spacing[3] },
  restaurantCard: {},
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  restaurantInfo: { flex: 1, gap: 2 },
  cardTitle: { marginBottom: spacing[3] },
  timeline: { gap: spacing[3] },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  stepDot: {
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepInfo: { flex: 1, gap: 2 },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.md,
    padding: spacing[4],
  },
  timelineText: { flex: 1, gap: 2 },
  etaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
    padding: spacing[3],
    marginTop: spacing[3],
  },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3] },
  itemInfo: { flex: 1, gap: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[1] },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  stars: { flexDirection: 'row', gap: spacing[1] },
  actionsRow: { flexDirection: 'row', gap: spacing[3] },
  ratingContent: { gap: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[4] },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing[3] },
  ratingStar: { fontSize: 36 },
  reviewInput: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
