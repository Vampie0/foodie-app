import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Avatar } from '../../../components/ui/AppImage';
import { Divider } from '../../../components/ui/Divider';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useAuthStore } from '../../../stores/authStore';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { useToast } from '../../../components/ui/Toast';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  value?: string;
}

function MenuRow({ icon, label, onPress, destructive = false, value }: MenuRowProps) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: theme.colors.surfaceSubtle }]}>
        <AppText style={{ fontSize: 18 }}>{icon}</AppText>
      </View>
      <AppText
        variant="labelLarge"
        color={destructive ? theme.colors.error : theme.colors.text}
        style={styles.menuLabel}
      >
        {label}
      </AppText>
      {value ? (
        <AppText variant="small" color={theme.colors.textMuted}>{value}</AppText>
      ) : (
        <AppText color={theme.colors.textMuted} style={styles.chevron}>›</AppText>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const { currentRestaurant } = useRestaurantStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/welcome');
    } catch {
      toast.error('Logout failed', 'Please try again');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing[20] }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing[3], backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
          <View style={styles.avatarRow}>
            <Avatar
              source={{ uri: user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? 'U')}&background=FF6B35&color=fff&size=96` }}
              size={72}
            />
            <View style={styles.userInfo}>
              <AppText variant="titleSmall" color={theme.colors.text} weight="700">
                {user?.fullName ?? 'Guest'}
              </AppText>
              <AppText variant="small" color={theme.colors.textSecondary}>
                {user?.email}
              </AppText>
              <AppText variant="small" color={theme.colors.textMuted}>
                {user?.phone}
              </AppText>
            </View>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: theme.colors.surfaceSubtle, borderColor: theme.colors.border }]}
              onPress={() => router.push('/(app)/profile/edit')}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <AppText variant="label" color={theme.colors.primary} weight="600">Edit</AppText>
            </TouchableOpacity>
          </View>

          {/* Current restaurant */}
          {currentRestaurant && (
            <TouchableOpacity
              style={[styles.restaurantBanner, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => router.push('/(app)/profile/switch-restaurant')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Currently at ${currentRestaurant.name}. Tap to switch`}
            >
              <AppText style={{ fontSize: 16 }}>🍽</AppText>
              <View style={styles.restaurantBannerInfo}>
                <AppText variant="label" color={theme.colors.primary} weight="600" numberOfLines={1}>
                  {currentRestaurant.name}
                </AppText>
                <AppText variant="caption" color={theme.colors.primary}>
                  Tap to switch restaurant
                </AppText>
              </View>
              <AppText color={theme.colors.primary}>›</AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Account section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionTitle} weight="600">
            ACCOUNT
          </AppText>
          <MenuRow icon="👤" label="Edit Profile" onPress={() => router.push('/(app)/profile/edit')} />
          <Divider inset={spacing[12] + spacing[3]} />
          <MenuRow icon="📍" label="Addresses" onPress={() => router.push('/(app)/profile/addresses')} />
          <Divider inset={spacing[12] + spacing[3]} />
          <MenuRow icon="❤️" label="Favorites" onPress={() => router.push('/(app)/profile/favorites')} />
        </View>

        {/* App section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionTitle} weight="600">
            APP
          </AppText>
          <MenuRow icon="🔔" label="Notifications" onPress={() => router.push('/(app)/profile/settings')} />
          <Divider inset={spacing[12] + spacing[3]} />
          <MenuRow icon="⚙️" label="Settings" onPress={() => router.push('/(app)/profile/settings')} />
          <Divider inset={spacing[12] + spacing[3]} />
          <MenuRow icon="🌐" label="Language" onPress={() => router.push('/(app)/profile/settings')} value="English" />
        </View>

        {/* Restaurant section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionTitle} weight="600">
            RESTAURANT
          </AppText>
          <MenuRow icon="🔄" label="Switch Restaurant" onPress={() => router.push('/(app)/profile/switch-restaurant')} />
        </View>

        {/* Danger zone */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <MenuRow
            icon="🚪"
            label="Log Out"
            onPress={() => setShowLogoutConfirm(true)}
            destructive
          />
        </View>

        {/* Version */}
        <AppText variant="caption" color={theme.colors.textMuted} align="center" style={styles.version}>
          FoodieApp v1.0.0
        </AppText>
      </ScrollView>

      <ConfirmationModal
        visible={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        destructive
        loading={isLoggingOut}
      />
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
    marginBottom: spacing[3],
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  userInfo: { flex: 1, gap: 3 },
  editBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  restaurantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing[3],
    gap: spacing[3],
  },
  restaurantBannerInfo: { flex: 1, gap: 1 },
  section: {
    marginBottom: spacing[3],
    paddingHorizontal: spacing[5],
  },
  sectionTitle: {
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    letterSpacing: 0.8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[4],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1 },
  chevron: { fontSize: 22, lineHeight: 28 },
  version: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
});
