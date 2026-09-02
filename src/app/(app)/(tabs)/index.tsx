import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Badge } from '../../../components/ui/Badge';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { RestaurantHeader } from '../../../components/restaurant/RestaurantHeader';
import { DealCard } from '../../../components/restaurant/DealCard';
import { MenuItemCard } from '../../../components/menu/MenuItemCard';
import { HomeScreenSkeleton } from '../../../components/skeletons/HomeScreenSkeleton';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useRestaurant } from '../../../queries/restaurantQueries';
import { useDeals } from '../../../queries/dealsQueries';
import { MenuItem } from '../../../types/restaurant';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { UI } from '../../../constants/ui';
import { useDebounce } from '../../../hooks/useDebounce';
import { searchMenuItems } from '../../../lib/dummyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();
  const storedRestaurant = useRestaurantStore(s => s.currentRestaurant);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, UI.SEARCH_DEBOUNCE_MS);

  const restaurantId = storedRestaurant?.id ?? '';

  const {
    data: restaurant,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useRestaurant(restaurantId);

  const { data: deals } = useDeals(restaurantId);

  const activeRestaurant = restaurant ?? storedRestaurant;

  // Filter menu items
  const filteredItems = React.useMemo(() => {
    if (!activeRestaurant) return [];
    if (debouncedQuery.trim()) {
      return searchMenuItems(activeRestaurant.id, debouncedQuery);
    }
    if (selectedCategoryId) {
      return activeRestaurant.menuItems.filter(
        i => i.categoryId === selectedCategoryId && i.isAvailable
      );
    }
    return activeRestaurant.menuItems.filter(i => i.isAvailable);
  }, [activeRestaurant, debouncedQuery, selectedCategoryId]);

  const popularItems = React.useMemo(
    () => activeRestaurant?.menuItems.filter(i => i.isPopular && i.isAvailable).slice(0, 6) ?? [],
    [activeRestaurant]
  );

  const handleItemPress = useCallback(
    (item: MenuItem) => router.push(`/(app)/menu/${item.id}`),
    [router]
  );

  if (isLoading && !activeRestaurant) {
    return <HomeScreenSkeleton />;
  }

  if (isError && !activeRestaurant) {
    return (
      <ErrorState
        title="Couldn't load restaurant"
        message="Pull down to refresh or tap retry"
        onRetry={refetch}
      />
    );
  }

  if (!activeRestaurant) return null;

  const isSearching = debouncedQuery.trim().length > 0;
  const categories = activeRestaurant.categories;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Sticky top section */}
      <View style={[styles.stickyTop, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <RestaurantHeader restaurant={activeRestaurant} />

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search ${activeRestaurant.name}...`}
          />
        </View>

        {/* Category chips — only show when not searching */}
        {!isSearching && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategoryId === null
                    ? theme.colors.primary
                    : theme.colors.surfaceSubtle,
                  borderColor: selectedCategoryId === null ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedCategoryId(null)}
              accessible
              accessibilityRole="button"
              accessibilityLabel="All items"
              accessibilityState={{ selected: selectedCategoryId === null }}
            >
              <AppText
                variant="label"
                color={selectedCategoryId === null ? theme.colors.onPrimary : theme.colors.text}
                weight="600"
              >
                All
              </AppText>
            </TouchableOpacity>

            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategoryId === cat.id
                      ? theme.colors.primary
                      : theme.colors.surfaceSubtle,
                    borderColor: selectedCategoryId === cat.id ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${cat.name} category`}
                accessibilityState={{ selected: selectedCategoryId === cat.id }}
              >
                <AppText
                  variant="label"
                  color={selectedCategoryId === cat.id ? theme.colors.onPrimary : theme.colors.text}
                  weight="600"
                >
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Main scrollable content */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + UI.TAB_BAR_HEIGHT + spacing[6] },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          isSearching ? (
            <View style={styles.searchHeader}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{debouncedQuery}"
              </AppText>
            </View>
          ) : (
            <View>
              {/* Deals carousel */}
              {deals && deals.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Today's Deals" actionLabel="See all" style={styles.sectionHeader} />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dealsScroll}
                  >
                    {deals.map(deal => (
                      <DealCard key={deal.id} deal={deal} width={SCREEN_WIDTH * 0.78} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Popular items — horizontal rail */}
              {popularItems.length > 0 && !selectedCategoryId && (
                <View style={styles.section}>
                  <SectionHeader
                    title="Most Popular"
                    actionLabel="See all"
                    onAction={() => setSelectedCategoryId(null)}
                    style={styles.sectionHeader}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.popularScroll}
                  >
                    {popularItems.map(item => (
                      <View key={item.id} style={{ width: 160, marginRight: spacing[3] }}>
                        <MenuItemCard
                          item={item}
                          layout="grid"
                          onPress={handleItemPress}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Full menu section title */}
              <View style={[styles.sectionHeader, styles.menuTitle]}>
                <SectionHeader
                  title={
                    selectedCategoryId
                      ? (categories.find(c => c.id === selectedCategoryId)?.name ?? 'Menu')
                      : 'Full Menu'
                  }
                  subtitle={`${filteredItems.length} items`}
                />
              </View>
            </View>
          )
        }
        ListEmptyComponent={
          <EmptyState
            title="No items found"
            description={
              isSearching
                ? `No results for "${debouncedQuery}"`
                : 'No items available in this category'
            }
            actionLabel={isSearching ? 'Clear search' : undefined}
            onAction={isSearching ? () => setSearchQuery('') : undefined}
          />
        }
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            layout="grid"
            onPress={handleItemPress}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stickyTop: {
    zIndex: 10,
  },
  searchContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  categoryScroll: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  categoryChip: {
    paddingHorizontal: spacing[4],
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[3],
  },
  columnWrapper: {
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: spacing[2],
  },
  sectionHeader: {
    paddingHorizontal: spacing[1],
    marginBottom: spacing[3],
  },
  dealsScroll: {
    paddingRight: spacing[2],
    gap: spacing[3],
  },
  popularScroll: {
    paddingRight: spacing[2],
  },
  menuTitle: {
    marginBottom: spacing[2],
  },
  searchHeader: {
    paddingVertical: spacing[2],
  },
});
