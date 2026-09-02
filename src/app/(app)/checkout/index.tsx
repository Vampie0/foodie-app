import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { Badge } from '../../../components/ui/Badge';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { useToast } from '../../../components/ui/Toast';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useCartStore } from '../../../stores/cartStore';
import { useAuthStore } from '../../../stores/authStore';
import { useAddresses } from '../../../queries/addressQueries';
import { ordersApi } from '../../../api/orders';
import { formatPrice } from '../../../components/ui/Price';
import { normalizeError } from '../../../utils/error';
import { usePreventDoubleTap } from '../../../hooks/usePreventDoubleTap';
import { Address } from '../../../types/user';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { LIMITS } from '../../../constants/limits';

type OrderType = 'delivery' | 'takeaway';
type PaymentMethod = 'cash' | 'card' | 'wallet';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
      <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();

  const restaurant = useRestaurantStore(s => s.currentRestaurant);
  const { getCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { data: addresses } = useAddresses();

  const cart = restaurant ? getCart(restaurant.id) : null;
  const currency = restaurant?.currency ?? 'PKR';

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    addresses?.find(a => a.isDefault) ?? null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const clientOrderId = useRef(`req-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const canPlace =
    cart &&
    cart.items.length > 0 &&
    cart.subtotal >= (restaurant?.minimumOrderAmount ?? 0) &&
    (orderType === 'takeaway' || selectedAddress !== null);

  const doPlaceOrder = useCallback(async () => {
    if (!restaurant || !cart || !canPlace) return;
    setIsPlacing(true);
    try {
      const order = await ordersApi.createOrder({
        restaurantId: restaurant.id,
        cart,
        type: orderType,
        deliveryAddress: orderType === 'delivery' ? (selectedAddress ?? undefined) : undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
        clientOrderRequestId: clientOrderId.current,
      });

      // Only clear cart after confirmed order creation
      clearCart(restaurant.id);
      router.replace(`/(app)/checkout/success?orderId=${order.id}`);
    } catch (err) {
      const error = normalizeError(err);
      // Cart is intentionally NOT cleared on failure
      toast.error('Order failed', error.userMessage);
    } finally {
      setIsPlacing(false);
    }
  }, [restaurant, cart, canPlace, orderType, selectedAddress, paymentMethod, notes, clearCart, router, toast]);

  const handlePlaceOrder = usePreventDoubleTap(doPlaceOrder, 3000);

  if (!cart || !restaurant) return null;

  const effectiveDeliveryFee = orderType === 'takeaway' ? 0 : cart.deliveryFee;
  const effectiveTotal = cart.subtotal + cart.taxAmount + effectiveDeliveryFee - cart.discountAmount;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">Checkout</AppText>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order type */}
        <SectionCard title="Order Type">
          <View style={styles.segmentRow}>
            {(['delivery', 'takeaway'] as OrderType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.segment,
                  {
                    backgroundColor: orderType === type ? theme.colors.primary : theme.colors.surfaceSubtle,
                    borderColor: orderType === type ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setOrderType(type)}
                accessible
                accessibilityRole="radio"
                accessibilityState={{ checked: orderType === type }}
                accessibilityLabel={type === 'delivery' ? 'Delivery' : 'Takeaway'}
              >
                <AppText style={{ fontSize: 18 }}>{type === 'delivery' ? '🛵' : '🏃'}</AppText>
                <AppText
                  variant="label"
                  color={orderType === type ? theme.colors.onPrimary : theme.colors.text}
                  weight="600"
                >
                  {type === 'delivery' ? 'Delivery' : 'Takeaway'}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Delivery address */}
        {orderType === 'delivery' && (
          <SectionCard title="Delivery Address">
            {selectedAddress ? (
              <TouchableOpacity
                style={[styles.addressRow, { borderColor: theme.colors.border }]}
                onPress={() => setShowAddressPicker(true)}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Change delivery address"
              >
                <View style={styles.addressInfo}>
                  <AppText style={{ fontSize: 20 }}>
                    {selectedAddress.label === 'home' ? '🏠' : selectedAddress.label === 'work' ? '🏢' : '📍'}
                  </AppText>
                  <View style={styles.addressText}>
                    <AppText variant="labelLarge" color={theme.colors.text} weight="600" style={{ textTransform: 'capitalize' }}>
                      {selectedAddress.label}
                    </AppText>
                    <AppText variant="small" color={theme.colors.textSecondary} numberOfLines={2}>
                      {selectedAddress.streetAddress}, {selectedAddress.city}
                    </AppText>
                    {selectedAddress.instructions && (
                      <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1} style={{ fontStyle: 'italic' }}>
                        {selectedAddress.instructions}
                      </AppText>
                    )}
                  </View>
                </View>
                <AppText variant="label" color={theme.colors.primary} weight="600">Change</AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.addAddressBtn, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
                onPress={() => router.push('/(app)/profile/addresses')}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Add delivery address"
              >
                <AppText style={{ fontSize: 20 }}>➕</AppText>
                <AppText variant="label" color={theme.colors.primary} weight="600">Add Delivery Address</AppText>
              </TouchableOpacity>
            )}
          </SectionCard>
        )}

        {/* Payment method */}
        <SectionCard title="Payment Method">
          {([
            { key: 'cash', label: 'Cash on Delivery', icon: '💵' },
            { key: 'card', label: 'Credit / Debit Card', icon: '💳' },
            { key: 'wallet', label: 'Digital Wallet', icon: '📱' },
          ] as { key: PaymentMethod; label: string; icon: string }[]).map(pm => (
            <TouchableOpacity
              key={pm.key}
              style={[
                styles.paymentRow,
                {
                  borderColor: paymentMethod === pm.key ? theme.colors.primary : theme.colors.border,
                  backgroundColor: paymentMethod === pm.key ? theme.colors.primaryContainer : theme.colors.surface,
                },
              ]}
              onPress={() => setPaymentMethod(pm.key)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ checked: paymentMethod === pm.key }}
              accessibilityLabel={pm.label}
            >
              <View style={[styles.radioOuter, { borderColor: paymentMethod === pm.key ? theme.colors.primary : theme.colors.border }]}>
                {paymentMethod === pm.key && (
                  <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
              <AppText style={{ fontSize: 20 }}>{pm.icon}</AppText>
              <AppText
                variant="labelLarge"
                color={theme.colors.text}
                weight={paymentMethod === pm.key ? '600' : '400'}
                style={{ flex: 1 }}
              >
                {pm.label}
              </AppText>
              {pm.key === 'cash' && <Badge label="Available" variant="success" size="small" />}
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* Order notes */}
        <SectionCard title="Order Notes">
          <TextInput
            value={notes}
            onChangeText={t => setNotes(t.slice(0, LIMITS.MAX_ORDER_NOTE_CHARS))}
            placeholder="Any special instructions for your order..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            style={[
              styles.notesInput,
              { color: theme.colors.text, backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border },
            ]}
            accessibilityLabel="Order notes"
          />
          <AppText variant="caption" color={theme.colors.textMuted} align="right">
            {notes.length}/{LIMITS.MAX_ORDER_NOTE_CHARS}
          </AppText>
        </SectionCard>

        {/* Order summary */}
        <SectionCard title="Order Summary">
          {cart.items.map(item => (
            <View key={item.id} style={styles.summaryItem}>
              <AppText variant="body" color={theme.colors.textSecondary} style={{ minWidth: 24 }}>
                {item.quantity}×
              </AppText>
              <AppText variant="body" color={theme.colors.text} style={{ flex: 1 }} numberOfLines={1}>
                {item.name}
              </AppText>
              <AppText variant="body" color={theme.colors.text} weight="500">
                {formatPrice(item.totalPrice, currency)}
              </AppText>
            </View>
          ))}

          <Divider style={styles.divider} />

          {[
            { label: 'Subtotal', value: formatPrice(cart.subtotal, currency) },
            { label: `Tax (${Math.round((restaurant?.taxRate ?? 0) * 100)}%)`, value: formatPrice(cart.taxAmount, currency) },
            { label: 'Delivery fee', value: orderType === 'takeaway' ? 'Free' : formatPrice(effectiveDeliveryFee, currency) },
            ...(cart.discountAmount > 0 ? [{ label: 'Discount', value: `-${formatPrice(cart.discountAmount, currency)}`, color: theme.colors.success }] : []),
          ].map(row => (
            <View key={row.label} style={styles.priceRow}>
              <AppText variant="body" color={theme.colors.textSecondary}>{row.label}</AppText>
              <AppText variant="body" color={(row as { color?: string }).color ?? theme.colors.text} weight="500">
                {row.value}
              </AppText>
            </View>
          ))}

          <Divider style={styles.divider} />
          <View style={styles.priceRow}>
            <AppText variant="titleSmall" color={theme.colors.text} weight="700">Total</AppText>
            <AppText variant="titleSmall" color={theme.colors.primary} weight="700">
              {formatPrice(Math.max(0, effectiveTotal), currency)}
            </AppText>
          </View>
        </SectionCard>
      </ScrollView>

      {/* Sticky place order */}
      <View style={[styles.placeOrderBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          label={`Place Order · ${formatPrice(Math.max(0, effectiveTotal), currency)}`}
          variant="primary"
          size="large"
          disabled={!canPlace}
          onPress={handlePlaceOrder}
          accessibilityLabel={`Place order for ${formatPrice(Math.max(0, effectiveTotal), currency)}`}
        />
      </View>

      {/* Address picker sheet */}
      <BottomSheet
        visible={showAddressPicker}
        onClose={() => setShowAddressPicker(false)}
        title="Select Address"
        scrollable
      >
        {(addresses ?? []).map(addr => (
          <TouchableOpacity
            key={addr.id}
            style={[
              styles.addrOption,
              {
                borderColor: selectedAddress?.id === addr.id ? theme.colors.primary : theme.colors.border,
                backgroundColor: selectedAddress?.id === addr.id ? theme.colors.primaryContainer : theme.colors.surface,
              },
            ]}
            onPress={() => { setSelectedAddress(addr); setShowAddressPicker(false); }}
            accessible
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedAddress?.id === addr.id }}
          >
            <AppText style={{ fontSize: 22 }}>
              {addr.label === 'home' ? '🏠' : addr.label === 'work' ? '🏢' : '📍'}
            </AppText>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="labelLarge" color={theme.colors.text} weight="600" style={{ textTransform: 'capitalize' }}>
                {addr.label}
              </AppText>
              <AppText variant="small" color={theme.colors.textSecondary} numberOfLines={2}>
                {addr.streetAddress}, {addr.city}
              </AppText>
            </View>
            {selectedAddress?.id === addr.id && (
              <AppText color={theme.colors.primary} style={{ fontSize: 18 }}>✓</AppText>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.addAddressBtn, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer, marginTop: spacing[3] }]}
          onPress={() => { setShowAddressPicker(false); router.push('/(app)/profile/addresses'); }}
        >
          <AppText style={{ fontSize: 18 }}>➕</AppText>
          <AppText variant="label" color={theme.colors.primary} weight="600">Add New Address</AppText>
        </TouchableOpacity>
      </BottomSheet>

      <LoadingOverlay visible={isPlacing} message="Placing your order..." transparent />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
  },
  scrollContent: {
    gap: spacing[3],
    paddingTop: spacing[3],
  },
  sectionCard: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  sectionTitle: {
    marginBottom: spacing[1],
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: spacing[3],
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    flex: 1,
  },
  addressText: { flex: 1, gap: 2 },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    gap: spacing[2],
    borderStyle: 'dashed',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: spacing[3],
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  notesInput: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  divider: { marginVertical: spacing[2] },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  placeOrderBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  addrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[2],
  },
});
