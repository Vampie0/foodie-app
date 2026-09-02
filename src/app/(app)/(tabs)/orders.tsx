import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AppImage } from '../../../components/ui/AppImage';
import { Button } from '../../../components/ui/Button';
import { useActiveOrders, useOrderHistory } from '../../../queries/orderQueries';
import { Order, OrderStatus } from '../../../types/order';
import { formatPrice } from '../../../components/ui/Price';
import {
  getStatusLabel,
  isActiveOrder,
} from '../../../utils/orderStateMachine';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

type Tab = 'active' | 'history';

function statusVariant(status: OrderStatus): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'out_for_delivery': return 'info';
    case 'preparing':
    case 'ready': return 'warning';
    default: return 'neutral';
  }
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const theme = useAppTheme();
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber} from ${order.restaurantName}. Status: ${getStatusLabel(order.status)}`}
    >
      <Card variant="elevated" padding="medium" style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <AppImage
            source={{ uri: order.restaurantLogo }}
            width={40}
            height={40}
            borderRadius={radius.md}
            style={{ width: 40, height: 40 }}
          />
          <View style={styles.orderMeta}>
            <AppText variant="labelLarge" color={theme.colors.text} weight="600" numberOfLines={1}>
              {order.restaurantName}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              #{order.orderNumber}
            </AppText>
          </View>
          <Badge
            label={getStatusLabel(order.status)}
            variant={statusVariant(order.status)}
            size="small"
            dot
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderItems}>
          <AppText variant="small" color={theme.colors.textSecondary} numberOfLines={2}>
            {order.items.slice(0, 2).map(i => `${i.quantity}× ${i.name}`).join('  ·  ')}
            {order.items.length > 2 ? `  +${order.items.length - 2} more` : ''}
          </AppText>
        </View>

        <View style={styles.orderFooter}>
          <View>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </AppText>
            <AppText variant="labelLarge" color={theme.colors.text} weight="700">
              {formatPrice(order.total, 'PKR')}
            </AppText>
          </View>
          <View style={styles.orderActions}>
            {isActiveOrder(order.status) && (
              <View style={[styles.activeDot, { backgroundColor: theme.colors.success }]} />
            )}
            <AppText variant="label" color={theme.colors.primary} weight="600">
              {isActiveOrder(order.status) ? 'Track →' : 'View →'}
            </AppText>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const { data: activeOrders, isLoading: loadingActive, refetch: refetchActive, isRefetching: refetchingActive } = useActiveOrders();
  const { data: historyOrders, isLoading: loadingHistory, refetch: refetchHistory, isRefetching: refetchingHistory } = useOrderHistory();

  const isActive = activeTab === 'active';
  const orders = isActive ? (activeOrders ?? []) : (historyOrders ?? []);
  const isLoading = isActive ? loadingActive : loadingHistory;
  const isRefetching = isActive ? refetchingActive : refetchingHistory;
  const refetch = isActive ? refetchActive : refetchHistory;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <AppText variant="titleLarge" color={theme.colors.text} weight="700">Orders</AppText>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: theme.colors.surfaceSubtle }]}>
          {(['active', 'history'] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && [styles.tabActive, { backgroundColor: theme.colors.surface }],
              ]}
              onPress={() => setActiveTab(tab)}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
              accessibilityLabel={tab === 'active' ? 'Active orders' : 'Order history'}
            >
              <AppText
                variant="label"
                color={activeTab === tab ? theme.colors.text : theme.colors.textMuted}
                weight={activeTab === tab ? '600' : '400'}
              >
                {tab === 'active' ? 'Active' : 'History'}
              </AppText>
              {tab === 'active' && (activeOrders?.length ?? 0) > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: theme.colors.primary }]}>
                  <AppText style={styles.tabBadgeText} color="#fff">{activeOrders!.length}</AppText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/(app)/orders/${item.id}`)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing[20] },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<AppText style={{ fontSize: 48 }}>📋</AppText>}
              title={isActive ? 'No active orders' : 'No order history'}
              description={
                isActive
                  ? 'Your current orders will appear here'
                  : 'Your past orders will appear here'
              }
              actionLabel={isActive ? 'Browse Menu' : undefined}
              onAction={isActive ? () => router.push('/(app)/(tabs)') : undefined}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    gap: spacing[4],
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    gap: spacing[1],
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing[5],
  },
  orderCard: {
    gap: spacing[3],
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  orderMeta: {
    flex: 1,
    gap: 2,
  },
  divider: {
    marginVertical: spacing[1],
  },
  orderItems: {},
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
