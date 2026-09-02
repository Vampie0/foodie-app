import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from '../../components/ui/AppText';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { AppImage } from '../../components/ui/AppImage';
import { Divider } from '../../components/ui/Divider';
import { useRestaurants } from '../../queries/restaurantQueries';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useCartStore } from '../../stores/cartStore';
import { useDebounce } from '../../hooks/useDebounce';
import { Restaurant } from '../../types/restaurant';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { UI } from '../../constants/ui';

export default function RestaurantSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, UI.SEARCH_DEBOUNCE_MS);

  const { data: restaurants, isLoading, isError, refetch } = useRestaurants(debouncedQuery);
  const { setCurrentRestaurant } = useRestaurantStore();
  const { setActiveRestaurant } = useCartStore();

  const handleSelectRestaurant = useCallback(
    (restaurant: Restaurant) => {
      setCurrentRestaurant(restaurant);
      setActiveRestaurant(restaurant.id, restaurant.taxRate, restaurant.deliveryFee);
      router.replace('/(app)/(tabs)');
    },
    [setCurrentRestaurant, setActiveRestaurant, router]
  );

  const renderItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={[
        styles.restaurantCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleSelectRestaurant(item)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.name}. ${item.isOpen ? 'Open' : 'Closed'}. Minimum order ${item.currency} ${item.minimumOrderAmount}`}
      activeOpacity={0.88}
    >
      <AppImage
        source={{ uri: item.coverImage ?? item.logo }}
        width={80}
        height={80}
        borderRadius={radius.lg}
        style={{ width: 80, height: 80 }}
      />

      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <AppText variant="titleSmall" color={theme.colors.text} weight="600" numberOfLines={1}>
            {item.name}
          </AppText>
          <Badge
            label={item.isOpen ? 'Open' : 'Closed'}
            variant={item.isOpen ? 'success' : 'neutral'}
            size="small"
          />
        </View>

        <AppText variant="small" color={theme.colors.textSecondary} numberOfLines={1}>
          {item.address}
        </AppText>

        <View style={styles.cardMeta}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            ⏱ {item.estimatedDeliveryTime}
          </AppText>
          <View style={styles.dot} />
          <AppText variant="caption" color={theme.colors.textMuted}>
            ⭐ {item.rating.toFixed(1)}
          </AppText>
          {item.distance !== undefined && (
            <>
              <View style={styles.dot} />
              <AppText variant="caption" color={theme.colors.textMuted}>
                📍 {item.distance.toFixed(1)} km
              </AppText>
            </>
          )}
        </View>

        <AppText variant="caption" color={theme.colors.textMuted}>
          Min. {item.currency} {item.minimumOrderAmount} · Delivery {item.currency} {item.deliveryFee}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing[4], borderBottomColor: theme.colors.divider },
        ]}
      >
        <AppText variant="titleLarge" color={theme.colors.text} weight="700">
          Find a Restaurant
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary} style={styles.headerSub}>
          Select a restaurant to start your order
        </AppText>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search restaurants..."
          style={styles.search}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText variant="body" color={theme.colors.textSecondary} style={{ marginTop: spacing[3] }}>
            Finding restaurants...
          </AppText>
        </View>
      ) : isError ? (
        <ErrorState
          title="Couldn't load restaurants"
          message="Please check your connection and try again"
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing[6] },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No restaurants found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'No restaurants are available right now'
              }
              actionLabel={searchQuery ? 'Clear search' : undefined}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
            />
          }
        />
      )}

      {/* QR Scanner option */}
      <View style={[styles.qrFooter, { borderTopColor: theme.colors.divider, paddingBottom: insets.bottom + spacing[4] }]}>
        <TouchableOpacity
          style={[styles.qrButton, { backgroundColor: theme.colors.surfaceSubtle }]}
          onPress={() => router.push('/(app)/restaurant/qr-scanner')}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Scan QR code to select restaurant"
        >
          <AppText style={styles.qrIcon}>📷</AppText>
          <AppText variant="labelLarge" color={theme.colors.text} weight="600">
            Scan QR Code
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    gap: spacing[2],
  },
  headerSub: {
    marginBottom: spacing[2],
  },
  search: {
    marginTop: spacing[2],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing[5],
  },
  restaurantCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[4],
    gap: spacing[4],
  },
  cardInfo: {
    flex: 1,
    gap: spacing[1],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
  },
  qrFooter: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  qrIcon: {
    fontSize: 20,
  },
});
