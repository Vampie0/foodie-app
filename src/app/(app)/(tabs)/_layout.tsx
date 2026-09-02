import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { useCartStore } from '../../../stores/cartStore';
import { useRestaurantStore } from '../../../stores/restaurantStore';

function TabIcon({
  emoji,
  label,
  focused,
  badgeCount,
}: {
  emoji: string;
  label: string;
  focused: boolean;
  badgeCount?: number;
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.tabItem}>
      <View style={styles.iconWrapper}>
        <AppText style={[styles.emoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</AppText>
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <AppText style={styles.badgeText}>{badgeCount > 9 ? '9+' : String(badgeCount)}</AppText>
          </View>
        )}
      </View>
      <AppText
        variant="caption"
        color={focused ? theme.colors.primary : theme.colors.textMuted}
        weight={focused ? '600' : '400'}
        style={styles.tabLabel}
      >
        {label}
      </AppText>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const currentRestaurant = useRestaurantStore(s => s.currentRestaurant);
  const cart = useCartStore(s =>
    currentRestaurant ? s.carts[currentRestaurant.id] : null
  );
  const cartCount = cart?.itemCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64 + (insets.bottom > 0 ? 0 : 8),
          paddingBottom: insets.bottom > 0 ? insets.bottom - 8 : 8,
          paddingTop: 8,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Orders" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Orders tab',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🛒" label="Cart" focused={focused} badgeCount={cartCount} />
          ),
          tabBarAccessibilityLabel: `Cart tab${cartCount > 0 ? `, ${cartCount} items` : ''}`,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  iconWrapper: {
    position: 'relative',
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  tabLabel: {
    fontSize: 10,
  },
});
