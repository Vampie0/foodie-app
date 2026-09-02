import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from '../ui/AppText';
import { AppImage } from '../ui/AppImage';
import { Badge } from '../ui/Badge';
import { Price } from '../ui/Price';
import { MenuItem } from '../../types/restaurant';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useCartStore } from '../../stores/cartStore';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { getItemPriceRange } from '../../utils/money';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { spring } from '../../theme/motion';

type CardLayout = 'grid' | 'list' | 'compact';

interface MenuItemCardProps {
  item: MenuItem;
  layout?: CardLayout;
  onPress?: (item: MenuItem) => void;
  showFavorite?: boolean;
}

export function MenuItemCard({
  item,
  layout = 'grid',
  onPress,
  showFavorite = true,
}: MenuItemCardProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const restaurant = useRestaurantStore(s => s.currentRestaurant);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { getCart } = useCartStore();

  const isFav = restaurant ? isFavorite(restaurant.id, item.id) : false;
  const cart = restaurant ? getCart(restaurant.id) : null;
  const cartQty = cart?.items.reduce(
    (sum, ci) => (ci.menuItemId === item.id ? sum + ci.quantity : sum),
    0
  ) ?? 0;

  const heartScale = useSharedValue(1);
  const cartBump = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const cartBumpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBump.value }],
  }));

  const handleFavoritePress = useCallback(() => {
    if (!restaurant) return;
    heartScale.value = withSpring(1.4, spring.bouncy, () => {
      heartScale.value = withSpring(1, spring.gentle);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(restaurant.id, item.id);
  }, [restaurant, item.id, toggleFavorite]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(item);
    } else {
      router.push(`/(app)/menu/${item.id}`);
    }
  }, [item, onPress, router]);

  const priceRange = getItemPriceRange(item);
  const currency = restaurant?.currency ?? 'PKR';

  if (layout === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={handlePress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${item.name}. ${item.description}. Price: ${currency} ${priceRange.min}`}
        activeOpacity={0.88}
      >
        <AppImage
          source={{ uri: item.image }}
          width={96}
          height={96}
          borderRadius={radius.lg}
          style={{ width: 96, height: 96 }}
        />

        <View style={styles.listInfo}>
          <View style={styles.listTop}>
            <View style={styles.badges}>
              {item.isPopular && <Badge label="Popular" variant="primary" size="small" />}
              {item.isNew && <Badge label="New" variant="info" size="small" />}
              {item.isSpicy && <Badge label="🌶 Spicy" variant="warning" size="small" />}
            </View>
            {showFavorite && (
              <Animated.View style={heartStyle}>
                <TouchableOpacity
                  onPress={handleFavoritePress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <AppText style={styles.heartIcon}>{isFav ? '❤️' : '🤍'}</AppText>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          <AppText variant="labelLarge" color={theme.colors.text} weight="600" numberOfLines={2}>
            {item.name}
          </AppText>

          <AppText variant="small" color={theme.colors.textMuted} numberOfLines={2} style={styles.description}>
            {item.description}
          </AppText>

          <View style={styles.listBottom}>
            <Price
              amount={priceRange.min}
              currency={currency}
              variant="titleSmall"
              color={theme.colors.primary}
            />
            {cartQty > 0 && (
              <Animated.View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }, cartBumpStyle]}>
                <AppText variant="caption" color={theme.colors.onPrimary} weight="700">
                  {cartQty} in cart
                </AppText>
              </Animated.View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid layout (default)
  return (
    <TouchableOpacity
      style={[styles.gridCard, { backgroundColor: theme.colors.surface }]}
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.name}. Price: ${currency} ${priceRange.min}${item.isPopular ? '. Popular' : ''}`}
      activeOpacity={0.88}
    >
      <View style={styles.imageWrapper}>
        <AppImage
          source={{ uri: item.image }}
          width="100%"
          height={140}
          borderRadius={0}
          style={{ width: '100%', height: 140 }}
          containerStyle={{ borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden' }}
        />

        {/* Badges overlay */}
        {(item.isPopular || item.isNew) && (
          <View style={styles.imageBadges}>
            {item.isPopular && <Badge label="Popular" variant="primary" size="small" />}
            {item.isNew && <Badge label="New" variant="info" size="small" />}
          </View>
        )}

        {/* Cart qty indicator */}
        {cartQty > 0 && (
          <Animated.View style={[styles.cartQtyBadge, { backgroundColor: theme.colors.primary }, cartBumpStyle]}>
            <AppText variant="caption" color={theme.colors.onPrimary} weight="700">
              {cartQty}
            </AppText>
          </Animated.View>
        )}

        {showFavorite && (
          <Animated.View style={[styles.favoriteBtn, heartStyle]}>
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={[styles.favoriteBtnInner, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <AppText style={{ fontSize: 14 }}>{isFav ? '❤️' : '🤍'}</AppText>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.gridInfo}>
        <AppText variant="label" color={theme.colors.text} weight="600" numberOfLines={2} style={styles.gridName}>
          {item.name}
        </AppText>

        {item.calories !== undefined && (
          <AppText variant="caption" color={theme.colors.textMuted}>
            {item.calories} cal{item.prepTimeMinutes ? `  ·  ${item.prepTimeMinutes} min` : ''}
          </AppText>
        )}

        <View style={styles.gridBottom}>
          <Price
            amount={priceRange.min}
            currency={currency}
            variant="label"
            color={theme.colors.primary}
            weight="700"
          />
          {!item.isAvailable && (
            <Badge label="Sold out" variant="neutral" size="small" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: '48%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageBadges: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    flexDirection: 'row',
    gap: 4,
  },
  cartQtyBadge: {
    position: 'absolute',
    bottom: spacing[2],
    right: spacing[2],
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
  },
  favoriteBtnInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: spacing[3],
    gap: 3,
  },
  gridName: {
    lineHeight: 18,
  },
  gridBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  // List layout
  listCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    gap: spacing[3],
    padding: spacing[3],
  },
  listInfo: {
    flex: 1,
    gap: 3,
  },
  listTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  description: {
    lineHeight: 17,
  },
  listBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  heartIcon: {
    fontSize: 16,
  },
  cartBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
});
