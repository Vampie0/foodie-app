import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { AppImage } from '../../../components/ui/AppImage';
import { QuantitySelector } from '../../../components/ui/QuantitySelector';
import { Divider } from '../../../components/ui/Divider';
import { Price } from '../../../components/ui/Price';
import { ErrorState } from '../../../components/ui/ErrorState';
import { MenuItemDetailSkeleton } from '../../../components/skeletons/MenuItemSkeleton';
import { MenuItemCard } from '../../../components/menu/MenuItemCard';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useCartStore } from '../../../stores/cartStore';
import { useFavoritesStore } from '../../../stores/favoritesStore';
import { useToast } from '../../../components/ui/Toast';
import { getMenuItemById } from '../../../lib/dummyData';
import {
  SelectedVariant,
  SelectedAddOn,
} from '../../../types/cart';
import {
  calculateUnitPrice,
  calculateItemTotal,
  formatPrice,
} from '../../../utils/money';
import { LIMITS } from '../../../constants/limits';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { spring } from '../../../theme/motion';

export default function MenuItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const restaurant = useRestaurantStore(s => s.currentRestaurant);
  const { addItem, getCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const item = restaurant ? getMenuItemById(restaurant.id, id) : undefined;

  // State
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, SelectedVariant>
  >(() => {
    if (!item) return {};
    const defaults: Record<string, SelectedVariant> = {};
    item.variantGroups.forEach(group => {
      const def = group.variants.find(v => v.isDefault) ?? group.variants[0];
      if (def) {
        defaults[group.id] = {
          groupId: group.id,
          groupName: group.name,
          variantId: def.id,
          variantName: def.name,
          priceModifier: def.priceModifier,
        };
      }
    });
    return defaults;
  });

  const [selectedAddOns, setSelectedAddOns] = useState<
    Record<string, SelectedAddOn>
  >({});

  const addBtnScale = useSharedValue(1);
  const addBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addBtnScale.value }],
  }));

  const isFav = restaurant ? isFavorite(restaurant.id, id) : false;
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  // Compute live unit price
  const unitPrice = useMemo(() => {
    if (!item) return 0;
    return calculateUnitPrice({
      id: '',
      restaurantId: restaurant?.id ?? '',
      menuItemId: item.id,
      name: item.name,
      basePrice: item.basePrice,
      selectedVariants: Object.values(selectedVariants),
      selectedAddOns: Object.values(selectedAddOns),
      quantity,
    });
  }, [item, selectedVariants, selectedAddOns, quantity, restaurant]);

  const totalPrice = calculateItemTotal(unitPrice, quantity);
  const currency = restaurant?.currency ?? 'PKR';

  // Check if all required groups have a selection
  const allRequiredSelected = useMemo(() => {
    if (!item) return false;
    for (const group of item.variantGroups) {
      if (group.isRequired && !selectedVariants[group.id]) return false;
    }
    for (const group of item.addOnGroups) {
      if (group.isRequired && !Object.values(selectedAddOns).some(a => a.groupId === group.id)) {
        return false;
      }
    }
    return true;
  }, [item, selectedVariants, selectedAddOns]);

  const handleVariantSelect = useCallback(
    (groupId: string, groupName: string, variantId: string, variantName: string, priceModifier: number) => {
      setSelectedVariants(prev => ({
        ...prev,
        [groupId]: { groupId, groupName, variantId, variantName, priceModifier },
      }));
    },
    []
  );

  const handleAddOnToggle = useCallback(
    (groupId: string, groupName: string, addOnId: string, addOnName: string, price: number) => {
      const key = `${groupId}:${addOnId}`;
      setSelectedAddOns(prev => {
        const next = { ...prev };
        if (next[key]) {
          delete next[key];
        } else {
          // Check max selections for group
          const group = item?.addOnGroups.find(g => g.id === groupId);
          const currentCount = Object.values(next).filter(a => a.groupId === groupId).length;
          if (group && currentCount >= group.maxSelections) {
            // Remove oldest from this group
            const keysForGroup = Object.keys(next).filter(k => next[k].groupId === groupId);
            if (keysForGroup.length > 0) delete next[keysForGroup[0]];
          }
          next[key] = { groupId, groupName, addOnId, addOnName, price };
        }
        return next;
      });
    },
    [item]
  );

  const handleAddToCart = useCallback(() => {
    if (!restaurant || !item) return;
    if (!allRequiredSelected) {
      toast.warning('Please complete your selection', 'Some required options are missing');
      return;
    }

    addItem(
      restaurant.id,
      {
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        basePrice: item.basePrice,
        selectedVariants: Object.values(selectedVariants),
        selectedAddOns: Object.values(selectedAddOns),
        quantity,
        notes: notes.trim() || undefined,
      },
      restaurant.taxRate,
      restaurant.deliveryFee
    );

    addBtnScale.value = withSpring(0.94, spring.stiff, () => {
      addBtnScale.value = withSpring(1, spring.gentle);
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success('Added to cart', `${quantity}× ${item.name}`);
    router.back();
  }, [
    restaurant, item, allRequiredSelected, selectedVariants, selectedAddOns,
    quantity, notes, addItem, toast, router, addBtnScale,
  ]);

  const handleFavoritePress = useCallback(() => {
    if (!restaurant) return;
    heartScale.value = withSpring(1.4, spring.bouncy, () => {
      heartScale.value = withSpring(1, spring.gentle);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(restaurant.id, id);
  }, [restaurant, id, toggleFavorite, heartScale]);

  if (!restaurant) return null;

  if (!item) {
    return (
      <ErrorState
        title="Item not found"
        message="This item may no longer be available"
        onRetry={() => router.back()}
      />
    );
  }

  const relatedItems = restaurant.menuItems
    .filter(i => i.categoryId === item.categoryId && i.id !== item.id && i.isAvailable)
    .slice(0, 4);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Hero image with back + favorite */}
        <View style={styles.imageContainer}>
          <AppImage
            source={{ uri: item.image }}
            width="100%"
            height={280}
            borderRadius={0}
            style={{ width: '100%', height: 280 }}
          />

          <View style={[styles.imageOverlay, { paddingTop: insets.top + spacing[2] }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <AppText color="#fff" variant="titleSmall" weight="600">←</AppText>
            </TouchableOpacity>

            <Animated.View style={heartStyle}>
              <TouchableOpacity
                style={styles.favBtn}
                onPress={handleFavoritePress}
                accessible
                accessibilityRole="button"
                accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <AppText style={{ fontSize: 20 }}>{isFav ? '❤️' : '🤍'}</AppText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Item info */}
        <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.badgeRow}>
            {item.isPopular && <Badge label="Popular" variant="primary" size="small" />}
            {item.isNew && <Badge label="New" variant="info" size="small" />}
            {item.isSpicy && <Badge label="🌶 Spicy" variant="warning" size="small" />}
            {item.isVegetarian && <Badge label="🌱 Veg" variant="success" size="small" />}
          </View>

          <AppText variant="titleLarge" color={theme.colors.text} weight="700" style={styles.itemName}>
            {item.name}
          </AppText>

          <AppText variant="body" color={theme.colors.textSecondary} style={styles.description}>
            {item.description}
          </AppText>

          {/* Meta chips */}
          <View style={styles.metaRow}>
            <Price
              amount={item.basePrice}
              currency={currency}
              variant="titleSmall"
              color={theme.colors.primary}
            />
            {item.calories !== undefined && (
              <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceSubtle }]}>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  🔥 {item.calories} cal
                </AppText>
              </View>
            )}
            {item.prepTimeMinutes !== undefined && (
              <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceSubtle }]}>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  ⏱ {item.prepTimeMinutes} min
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Variant groups */}
        {item.variantGroups.map(group => (
          <View key={group.id} style={[styles.optionSection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.optionHeader}>
              <AppText variant="titleSmall" color={theme.colors.text} weight="600">
                {group.name}
              </AppText>
              <Badge
                label={group.isRequired ? 'Required' : 'Optional'}
                variant={group.isRequired ? 'error' : 'neutral'}
                size="small"
              />
            </View>
            <AppText variant="caption" color={theme.colors.textMuted} style={styles.optionSubtitle}>
              Select one
            </AppText>

            {group.variants.map(variant => {
              const isSelected = selectedVariants[group.id]?.variantId === variant.id;
              return (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.optionRow,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                    },
                  ]}
                  onPress={() =>
                    handleVariantSelect(group.id, group.name, variant.id, variant.name, variant.priceModifier)
                  }
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${variant.name}${variant.priceModifier > 0 ? ` +${formatPrice(variant.priceModifier, currency)}` : ''}`}
                >
                  <View style={[styles.radioOuter, { borderColor: isSelected ? theme.colors.primary : theme.colors.border }]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                    )}
                  </View>
                  <AppText
                    variant="labelLarge"
                    color={theme.colors.text}
                    weight={isSelected ? '600' : '400'}
                    style={styles.optionLabel}
                  >
                    {variant.name}
                  </AppText>
                  {variant.priceModifier !== 0 && (
                    <AppText variant="label" color={theme.colors.primary} weight="600">
                      +{formatPrice(variant.priceModifier, currency)}
                    </AppText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Add-on groups */}
        {item.addOnGroups.map(group => (
          <View key={group.id} style={[styles.optionSection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.optionHeader}>
              <AppText variant="titleSmall" color={theme.colors.text} weight="600">
                {group.name}
              </AppText>
              <Badge
                label={group.isRequired ? 'Required' : 'Optional'}
                variant={group.isRequired ? 'error' : 'neutral'}
                size="small"
              />
            </View>
            <AppText variant="caption" color={theme.colors.textMuted} style={styles.optionSubtitle}>
              Select up to {group.maxSelections}
            </AppText>

            {group.addOns.map(addOn => {
              const key = `${group.id}:${addOn.id}`;
              const isSelected = Boolean(selectedAddOns[key]);
              return (
                <TouchableOpacity
                  key={addOn.id}
                  style={[
                    styles.optionRow,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                      opacity: addOn.isAvailable ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => {
                    if (!addOn.isAvailable) return;
                    handleAddOnToggle(group.id, group.name, addOn.id, addOn.name, addOn.price);
                  }}
                  disabled={!addOn.isAvailable}
                  accessible
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${addOn.name} +${formatPrice(addOn.price, currency)}`}
                >
                  <View
                    style={[
                      styles.checkboxOuter,
                      {
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && (
                      <AppText style={styles.checkmark} color="#fff">✓</AppText>
                    )}
                  </View>
                  <AppText
                    variant="labelLarge"
                    color={theme.colors.text}
                    weight={isSelected ? '600' : '400'}
                    style={styles.optionLabel}
                  >
                    {addOn.name}
                  </AppText>
                  <AppText variant="label" color={theme.colors.primary} weight="600">
                    +{formatPrice(addOn.price, currency)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Special instructions */}
        <View style={[styles.optionSection, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.notesTitle}>
            Special Instructions
          </AppText>
          <AppText variant="caption" color={theme.colors.textMuted} style={styles.optionSubtitle}>
            Optional — e.g. no onions, extra sauce
          </AppText>
          <TextInput
            value={notes}
            onChangeText={t => setNotes(t.slice(0, LIMITS.MAX_ITEM_NOTE_CHARS))}
            placeholder="Any special requests..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            style={[
              styles.notesInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.border,
              },
            ]}
            accessibilityLabel="Special instructions for this item"
          />
          <AppText variant="caption" color={theme.colors.textMuted} align="right">
            {notes.length}/{LIMITS.MAX_ITEM_NOTE_CHARS}
          </AppText>
        </View>

        {/* Related items */}
        {relatedItems.length > 0 && (
          <View style={styles.relatedSection}>
            <AppText variant="titleSmall" color={theme.colors.text} weight="600" style={styles.relatedTitle}>
              You might also like
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedItems.map(ri => (
                <View key={ri.id} style={{ width: 160, marginRight: spacing[3] }}>
                  <MenuItemCard item={ri} layout="grid" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom — quantity + add to cart */}
      <View
        style={[
          styles.stickyBottom,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom + spacing[4],
          },
        ]}
      >
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={LIMITS.MAX_ITEM_QUANTITY}
          size="medium"
        />

        <Animated.View style={[styles.addBtnWrapper, addBtnStyle]}>
          <Button
            label={`Add to Cart · ${formatPrice(totalPrice, currency)}`}
            variant="primary"
            size="large"
            onPress={handleAddToCart}
            disabled={!item.isAvailable || !allRequiredSelected}
            style={styles.addBtn}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    padding: spacing[5],
    marginBottom: spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  itemName: {
    marginBottom: spacing[2],
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  metaChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  optionSection: {
    padding: spacing[5],
    marginBottom: spacing[2],
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  optionSubtitle: {
    marginBottom: spacing[3],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[2],
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
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    lineHeight: 16,
  },
  optionLabel: {
    flex: 1,
  },
  notesTitle: {
    marginBottom: spacing[1],
  },
  notesInput: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing[4],
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing[1],
  },
  relatedSection: {
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  relatedTitle: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  relatedScroll: {
    paddingHorizontal: spacing[5],
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    gap: spacing[4],
    borderTopWidth: 1,
  },
  addBtnWrapper: {
    flex: 1,
  },
  addBtn: {
    flex: 1,
  },
});
