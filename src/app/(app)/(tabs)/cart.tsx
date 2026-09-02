import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Divider } from '../../../components/ui/Divider';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { AppImage } from '../../../components/ui/AppImage';
import { QuantitySelector } from '../../../components/ui/QuantitySelector';
import { Price, formatPrice } from '../../../components/ui/Price';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useCartStore } from '../../../stores/cartStore';
import { useToast } from '../../../components/ui/Toast';
import { CartItem } from '../../../types/cart';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { dealsApi } from '../../../api/deals';
import { UI } from '../../../constants/ui';

// Swipeable cart item row
function SwipeableCartItem({
  item,
  restaurantId,
  taxRate,
  deliveryFee,
  onRemove,
}: {
  item: CartItem;
  restaurantId: string;
  taxRate: number;
  deliveryFee: number;
  onRemove: (id: string) => void;
}) {
  const theme = useAppTheme();
  const { updateQuantity } = useCartStore();
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -80;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate(e => {
      translateX.value = Math.min(0, Math.max(-120, e.translationX));
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-100);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const variantSummary = item.selectedVariants.map(v => v.variantName).join(' · ');
  const addOnSummary = item.selectedAddOns.map(a => a.addOnName).join(', ');

  return (
    <View style={styles.swipeContainer}>
      {/* Delete background */}
      <View style={[styles.deleteBackground, { backgroundColor: theme.colors.errorLight }]}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onRemove(item.id)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.name} from cart`}
        >
          <AppText style={{ fontSize: 20 }}>🗑️</AppText>
          <AppText variant="caption" color={theme.colors.error} weight="600">Remove</AppText>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            rowStyle,
            styles.cartRow,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <AppImage
            source={{ uri: item.image }}
            width={72}
            height={72}
            borderRadius={radius.md}
            style={{ width: 72, height: 72 }}
          />

          <View style={styles.cartItemInfo}>
            <AppText variant="labelLarge" color={theme.colors.text} weight="600" numberOfLines={2}>
              {item.name}
            </AppText>
            {variantSummary ? (
              <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
                {variantSummary}
              </AppText>
            ) : null}
            {addOnSummary ? (
              <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
                + {addOnSummary}
              </AppText>
            ) : null}
            {item.notes ? (
              <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1} style={{ fontStyle: 'italic' }}>
                "{item.notes}"
              </AppText>
            ) : null}

            <View style={styles.cartItemBottom}>
              <Price amount={item.unitPrice} currency="PKR" variant="label" weight="700" />
              <QuantitySelector
                value={item.quantity}
                onChange={qty =>
                  updateQuantity(restaurantId, item.id, qty, taxRate, deliveryFee)
                }
                min={0}
                size="small"
              />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const restaurant = useRestaurantStore(s => s.currentRestaurant);
  const { getCart, removeItem, applyCoupon, removeCoupon, clearCart } = useCartStore();

  const cart = restaurant ? getCart(restaurant.id) : null;
  const taxRate = restaurant?.taxRate ?? 0.05;
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const currency = restaurant?.currency ?? 'PKR';

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemoveItem = useCallback(
    (cartItemId: string) => {
      if (!restaurant) return;
      removeItem(restaurant.id, cartItemId, taxRate, deliveryFee);
      toast.info('Item removed');
    },
    [restaurant, removeItem, taxRate, deliveryFee, toast]
  );

  const handleApplyCoupon = useCallback(async () => {
    if (!restaurant || !couponCode.trim() || !cart) return;
    setCouponLoading(true);
    try {
      const result = await dealsApi.validateCoupon(restaurant.id, couponCode.trim(), cart.subtotal);
      if (result.isValid && result.deal.id) {
        applyCoupon(restaurant.id, {
          code: couponCode.trim().toUpperCase(),
          dealId: result.deal.id,
          discountAmount: result.discountAmount,
          description: result.deal.title,
        }, taxRate, deliveryFee);
        toast.success('Coupon applied!', `You saved ${formatPrice(result.discountAmount, currency)}`);
        setCouponCode('');
      } else {
        toast.error('Invalid coupon', result.message ?? 'This coupon cannot be applied');
      }
    } catch {
      toast.error('Failed to apply coupon', 'Please try again');
    } finally {
      setCouponLoading(false);
    }
  }, [restaurant, couponCode, cart, applyCoupon, removeCoupon, taxRate, deliveryFee, toast, currency]);

  const handleRemoveCoupon = useCallback(() => {
    if (!restaurant) return;
    removeCoupon(restaurant.id, taxRate, deliveryFee);
    toast.info('Coupon removed');
  }, [restaurant, removeCoupon, taxRate, deliveryFee, toast]);

  const handleClearCart = useCallback(() => {
    if (!restaurant) return;
    clearCart(restaurant.id);
    setShowClearConfirm(false);
    toast.info('Cart cleared');
  }, [restaurant, clearCart, toast]);

  const meetsMinOrder = (cart?.subtotal ?? 0) >= (restaurant?.minimumOrderAmount ?? 0);
  const minOrderAmount = restaurant?.minimumOrderAmount ?? 0;

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700">Your Cart</AppText>
        </View>
        <EmptyState
          icon={<AppText style={{ fontSize: 52 }}>🛒</AppText>}
          title="Your cart is empty"
          description="Add items from the menu to get started"
          actionLabel="Browse Menu"
          onAction={() => router.push('/(app)/(tabs)')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <View style={styles.headerRow}>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700">Your Cart</AppText>
          <TouchableOpacity
            onPress={() => setShowClearConfirm(true)}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Clear all items from cart"
          >
            <AppText variant="label" color={theme.colors.error} weight="600">Clear</AppText>
          </TouchableOpacity>
        </View>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} from {restaurant?.name}
        </AppText>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 200 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SwipeableCartItem
            item={item}
            restaurantId={restaurant?.id ?? ''}
            taxRate={taxRate}
            deliveryFee={deliveryFee}
            onRemove={handleRemoveItem}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={
          <View style={styles.footer}>
            {/* Coupon input */}
            {!cart.coupon ? (
              <View style={[styles.couponRow, { borderColor: theme.colors.border }]}>
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter coupon code"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                  style={[styles.couponInput, { color: theme.colors.text }]}
                  accessibilityLabel="Coupon code input"
                />
                <Button
                  label="Apply"
                  variant="primary"
                  size="small"
                  fullWidth={false}
                  loading={couponLoading}
                  disabled={!couponCode.trim()}
                  onPress={handleApplyCoupon}
                />
              </View>
            ) : (
              <View style={[styles.appliedCoupon, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success }]}>
                <View style={styles.couponInfo}>
                  <AppText variant="label" color={theme.colors.success} weight="700">
                    🏷 {cart.coupon.code}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.success}>
                    {cart.coupon.description} — saved {formatPrice(cart.coupon.discountAmount, currency)}
                  </AppText>
                </View>
                <TouchableOpacity onPress={handleRemoveCoupon} accessible accessibilityRole="button" accessibilityLabel="Remove coupon">
                  <AppText variant="label" color={theme.colors.success}>✕</AppText>
                </TouchableOpacity>
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Price breakdown */}
            <View style={styles.priceBreakdown}>
              <PriceRow label="Subtotal" value={formatPrice(cart.subtotal, currency)} theme={theme} />
              <PriceRow label={`Tax (${Math.round(taxRate * 100)}%)`} value={formatPrice(cart.taxAmount, currency)} theme={theme} />
              <PriceRow label="Delivery fee" value={cart.deliveryFee > 0 ? formatPrice(cart.deliveryFee, currency) : 'Free'} theme={theme} />
              {cart.discountAmount > 0 && (
                <PriceRow
                  label="Discount"
                  value={`-${formatPrice(cart.discountAmount, currency)}`}
                  valueColor={theme.colors.success}
                  theme={theme}
                />
              )}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <AppText variant="titleSmall" color={theme.colors.text} weight="700">Total</AppText>
              <AppText variant="titleSmall" color={theme.colors.primary} weight="700">
                {formatPrice(cart.total, currency)}
              </AppText>
            </View>

            {!meetsMinOrder && (
              <View style={[styles.minOrderWarning, { backgroundColor: theme.colors.warningLight }]}>
                <AppText variant="small" color={theme.colors.warning} weight="600">
                  Minimum order is {formatPrice(minOrderAmount, currency)}.
                  Add {formatPrice(minOrderAmount - cart.subtotal, currency)} more.
                </AppText>
              </View>
            )}
          </View>
        }
      />

      {/* Checkout CTA */}
      <View
        style={[
          styles.checkoutBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom + spacing[4],
          },
        ]}
      >
        <Button
          label={`Checkout · ${formatPrice(cart.total, currency)}`}
          variant="primary"
          size="large"
          disabled={!meetsMinOrder}
          onPress={() => router.push('/(app)/checkout')}
          accessibilityLabel={`Proceed to checkout. Total: ${formatPrice(cart.total, currency)}`}
        />
      </View>

      <ConfirmationModal
        visible={showClearConfirm}
        title="Clear Cart?"
        message="Remove all items from your cart?"
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
        destructive
      />
    </View>
  );
}

function PriceRow({
  label,
  value,
  valueColor,
  theme,
}: {
  label: string;
  value: string;
  valueColor?: string;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={styles.priceRow}>
      <AppText variant="body" color={theme.colors.textSecondary}>{label}</AppText>
      <AppText variant="body" color={valueColor ?? theme.colors.text} weight="500">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    gap: spacing[1],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingTop: spacing[2],
  },
  swipeContainer: {
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    alignItems: 'center',
    gap: 4,
  },
  cartRow: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
  },
  cartItemInfo: {
    flex: 1,
    gap: 3,
  },
  cartItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
  footer: {
    padding: spacing[5],
    gap: spacing[3],
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
    paddingVertical: spacing[1],
    gap: spacing[2],
  },
  couponInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[4],
  },
  couponInfo: {
    gap: 2,
  },
  divider: {
    marginVertical: spacing[1],
  },
  priceBreakdown: {
    gap: spacing[2],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  minOrderWarning: {
    padding: spacing[3],
    borderRadius: radius.md,
    marginTop: spacing[2],
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
});
