import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { AppImage } from '../../../components/ui/AppImage';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useRestaurants } from '../../../queries/restaurantQueries';
import { useRestaurantSwitch } from '../../../hooks/useRestaurantSwitch';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useDebounce } from '../../../hooks/useDebounce';
import { Restaurant } from '../../../types/restaurant';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { UI } from '../../../constants/ui';

export default function SwitchRestaurantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Restaurant | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const debouncedSearch = useDebounce(search, UI.SEARCH_DEBOUNCE_MS);

  const { data: restaurants, isLoading, isError, refetch } = useRestaurants(debouncedSearch);
  const { currentRestaurant } = useRestaurantStore();
  const { switchToRestaurant } = useRestaurantSwitch();

  const handleSelect = (r: Restaurant) => {
    if (r.id === currentRestaurant?.id) { router.back(); return; }
    setPending(r);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setIsSwitching(true);
    await switchToRestaurant(pending.id);
    setIsSwitching(false);
    setPending(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">Switch Restaurant</AppText>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchWrapper}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search restaurants..." />
      </View>

      {isLoading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : isError ? (
        <ErrorState title="Couldn't load restaurants" onRetry={refetch} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={r => r.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing[6] }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          renderItem={({ item }) => {
            const isActive = item.id === currentRestaurant?.id;
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: isActive ? theme.colors.primaryContainer : theme.colors.surface,
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    borderWidth: isActive ? 1.5 : 1,
                  },
                ]}
                onPress={() => handleSelect(item)}
                accessible accessibilityRole="button"
                accessibilityLabel={`Select ${item.name}${isActive ? '. Currently selected' : ''}`}
                accessibilityState={{ selected: isActive }}
              >
                <AppImage source={{ uri: item.logo }} width={56} height={56} borderRadius={radius.lg} style={{ width: 56, height: 56 }} />
                <View style={styles.cardInfo}>
                  <View style={styles.cardTop}>
                    <AppText variant="labelLarge" color={theme.colors.text} weight="600" numberOfLines={1} style={{ flex: 1 }}>
                      {item.name}
                    </AppText>
                    {isActive && <Badge label="Current" variant="primary" size="small" />}
                  </View>
                  <AppText variant="small" color={theme.colors.textSecondary} numberOfLines={1}>{item.address}</AppText>
                  <View style={styles.meta}>
                    <Badge label={item.isOpen ? 'Open' : 'Closed'} variant={item.isOpen ? 'success' : 'neutral'} size="small" />
                    <AppText variant="caption" color={theme.colors.textMuted}>⭐ {item.rating.toFixed(1)}</AppText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<EmptyState title="No restaurants found" description={search ? `No results for "${search}"` : 'No restaurants available'} />}
        />
      )}

      <ConfirmationModal
        visible={pending !== null}
        title="Switch Restaurant?"
        message={`Switching to ${pending?.name} will clear your current cart. Continue?`}
        confirmLabel="Switch"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
        loading={isSwitching}
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
  searchWrapper: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing[5], paddingTop: spacing[2] },
  card: { flexDirection: 'row', borderRadius: radius.lg, padding: spacing[4], gap: spacing[3] },
  cardInfo: { flex: 1, gap: spacing[1] },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
});
