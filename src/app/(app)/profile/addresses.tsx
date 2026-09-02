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
import { useMutation } from '@tanstack/react-query';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { useAddresses } from '../../../queries/addressQueries';
import { addressesApi } from '../../../api/addresses';
import { queryClient } from '../../../providers/QueryProvider';
import { queryKeys } from '../../../queries/queryKeys';
import { Address } from '../../../types/user';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import AddressFormSheet from '../../../components/address/AddressFormSheet';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();

  const { data: addresses, isLoading } = useAddresses();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses() });
      setDeletingId(null);
      toast.success('Address deleted');
    },
    onError: () => toast.error('Failed to delete address'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressesApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses() });
      toast.success('Default address updated');
    },
  });

  const labelIcon = (label: Address['label']) =>
    label === 'home' ? '🏠' : label === 'work' ? '🏢' : '📍';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">Addresses</AppText>
        <TouchableOpacity onPress={() => setShowAddForm(true)} accessible accessibilityRole="button" accessibilityLabel="Add address">
          <AppText color={theme.colors.primary} variant="labelLarge">+ Add</AppText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={a => a.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing[6] }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          renderItem={({ item }) => (
            <Card variant="elevated" padding="medium">
              <View style={styles.addrRow}>
                <AppText style={{ fontSize: 24 }}>{labelIcon(item.label)}</AppText>
                <View style={styles.addrInfo}>
                  <View style={styles.addrHeader}>
                    <AppText variant="labelLarge" color={theme.colors.text} weight="600" style={{ textTransform: 'capitalize' }}>
                      {item.label}
                    </AppText>
                    {item.isDefault && <Badge label="Default" variant="primary" size="small" />}
                  </View>
                  <AppText variant="body" color={theme.colors.textSecondary} numberOfLines={2}>
                    {item.streetAddress}, {item.city}
                  </AppText>
                  {item.instructions && (
                    <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1} style={{ fontStyle: 'italic' }}>
                      {item.instructions}
                    </AppText>
                  )}
                </View>
              </View>

              <View style={styles.addrActions}>
                {!item.isDefault && (
                  <TouchableOpacity
                    onPress={() => setDefaultMutation.mutate(item.id)}
                    accessible accessibilityRole="button" accessibilityLabel="Set as default"
                  >
                    <AppText variant="label" color={theme.colors.primary}>Set Default</AppText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setEditingAddress(item)}
                  accessible accessibilityRole="button" accessibilityLabel="Edit address"
                >
                  <AppText variant="label" color={theme.colors.textSecondary}>Edit</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeletingId(item.id)}
                  accessible accessibilityRole="button" accessibilityLabel="Delete address"
                >
                  <AppText variant="label" color={theme.colors.error}>Delete</AppText>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<AppText style={{ fontSize: 48 }}>📍</AppText>}
              title="No addresses saved"
              description="Add a delivery address to get started"
              actionLabel="Add Address"
              onAction={() => setShowAddForm(true)}
            />
          }
        />
      )}

      <AddressFormSheet
        visible={showAddForm || editingAddress !== null}
        onClose={() => { setShowAddForm(false); setEditingAddress(null); }}
        editingAddress={editingAddress}
      />

      <ConfirmationModal
        visible={deletingId !== null}
        title="Delete Address?"
        message="This address will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
        destructive
        loading={deleteMutation.isPending}
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
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing[5] },
  addrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  addrInfo: { flex: 1, gap: 3 },
  addrHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  addrActions: { flexDirection: 'row', gap: spacing[4], marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: '#F0F0F0' },
});
