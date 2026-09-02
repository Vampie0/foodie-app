import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MenuItemCard } from '../../../components/menu/MenuItemCard';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useFavoritesStore } from '../../../stores/favoritesStore';
import { spacing } from '../../../theme/spacing';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const restaurant = useRestaurantStore(s => s.currentRestaurant);
  const { favorites } = useFavoritesStore();

  const favItemIds = restaurant ? Array.from(favorites[restaurant.id] ?? []) : [];
  const favItems = restaurant?.menuItems.filter(i => favItemIds.includes(i.id)) ?? [];

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">Favorites</AppText>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={favItems}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing[6] }]}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MenuItemCard item={item} layout="grid" />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<AppText style={{ fontSize: 48 }}>❤️</AppText>}
            title="No favorites yet"
            description="Tap the heart icon on any menu item to save it here"
            actionLabel="Browse Menu"
            onAction={() => router.push('/(app)/(tabs)')}
          />
        }
      />
    </View>
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
  listContent: { padding: spacing[4], gap: spacing[3] },
  columnWrapper: { gap: spacing[3], justifyContent: 'space-between' },
  cardWrapper: { width: '48%' },
});
