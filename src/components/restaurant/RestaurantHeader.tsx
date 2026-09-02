import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { AppImage } from '../ui/AppImage';
import { Restaurant } from '../../types/restaurant';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  onInfoPress?: () => void;
}

export function RestaurantHeader({ restaurant, onInfoPress }: RestaurantHeaderProps) {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
      <View style={styles.content}>
        {/* Logo */}
        <AppImage
          source={{ uri: restaurant.logo }}
          width={52}
          height={52}
          borderRadius={radius.lg}
          style={{ width: 52, height: 52 }}
        />

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <AppText
              variant="titleSmall"
              color={theme.colors.text}
              weight="700"
              numberOfLines={1}
              style={styles.name}
            >
              {restaurant.name}
            </AppText>
            <Badge
              label={restaurant.isOpen ? 'Open' : 'Closed'}
              variant={restaurant.isOpen ? 'success' : 'neutral'}
              size="small"
              dot
            />
          </View>

          <View style={styles.metaRow}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              ⏱ {restaurant.estimatedDeliveryTime}
            </AppText>
            <View style={styles.dot} />
            <AppText variant="caption" color={theme.colors.textMuted}>
              ⭐ {restaurant.rating.toFixed(1)} ({restaurant.reviewCount.toLocaleString()})
            </AppText>
          </View>
        </View>

        {/* Info button */}
        <TouchableOpacity
          style={[styles.infoBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
          onPress={onInfoPress ?? (() => router.push('/(app)/profile/switch-restaurant'))}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Restaurant info and switch"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText style={styles.infoIcon}>⚙️</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#AAAAAA',
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 18,
  },
});
