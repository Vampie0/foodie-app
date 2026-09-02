import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Divider } from '../../../components/ui/Divider';
import { useUIStore } from '../../../stores/uiStore';
import { spacing } from '../../../theme/spacing';

type ColorScheme = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { colorScheme, setColorScheme } = useUIStore();

  const schemes: { key: ColorScheme; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: '☀️' },
    { key: 'dark', label: 'Dark', icon: '🌙' },
    { key: 'system', label: 'System Default', icon: '📱' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">Settings</AppText>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}>
        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionLabel} weight="600">
            APPEARANCE
          </AppText>
          {schemes.map((s, i) => (
            <React.Fragment key={s.key}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setColorScheme(s.key)}
                accessible accessibilityRole="radio"
                accessibilityState={{ checked: colorScheme === s.key }}
                accessibilityLabel={s.label}
              >
                <AppText style={{ fontSize: 20 }}>{s.icon}</AppText>
                <AppText variant="labelLarge" color={theme.colors.text} style={{ flex: 1 }}>{s.label}</AppText>
                <View style={[styles.radio, { borderColor: colorScheme === s.key ? theme.colors.primary : theme.colors.border }]}>
                  {colorScheme === s.key && <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />}
                </View>
              </TouchableOpacity>
              {i < schemes.length - 1 && <Divider inset={spacing[12] + spacing[3]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionLabel} weight="600">
            NOTIFICATIONS
          </AppText>
          {[
            { label: 'Order Updates', desc: 'Status changes for your orders', enabled: true },
            { label: 'Promotions & Deals', desc: 'New deals from your restaurant', enabled: false },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.row}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="labelLarge" color={theme.colors.text}>{item.label}</AppText>
                  <AppText variant="caption" color={theme.colors.textMuted}>{item.desc}</AppText>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={() => {}}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                  accessible
                  accessibilityRole="switch"
                  accessibilityLabel={item.label}
                  accessibilityState={{ checked: item.enabled }}
                />
              </View>
              {i < arr.length - 1 && <Divider inset={spacing[5]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Language */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionLabel} weight="600">
            LANGUAGE
          </AppText>
          <TouchableOpacity style={styles.row}>
            <AppText style={{ fontSize: 20 }}>🌐</AppText>
            <AppText variant="labelLarge" color={theme.colors.text} style={{ flex: 1 }}>Language</AppText>
            <AppText variant="body" color={theme.colors.textMuted}>English</AppText>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionLabel} weight="600">
            ABOUT
          </AppText>
          {[
            { label: 'Privacy Policy', icon: '🔒' },
            { label: 'Terms of Service', icon: '📄' },
            { label: 'Version 1.0.0', icon: 'ℹ️' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.row} accessible accessibilityRole="button" accessibilityLabel={item.label}>
                <AppText style={{ fontSize: 20 }}>{item.icon}</AppText>
                <AppText variant="labelLarge" color={theme.colors.text} style={{ flex: 1 }}>{item.label}</AppText>
                {i < arr.length - 1 && <AppText color={theme.colors.textMuted} style={{ fontSize: 20 }}>›</AppText>}
              </TouchableOpacity>
              {i < arr.length - 1 && <Divider inset={spacing[12] + spacing[3]} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
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
  content: { gap: spacing[3], paddingTop: spacing[3] },
  section: { paddingHorizontal: spacing[5] },
  sectionLabel: { paddingTop: spacing[4], paddingBottom: spacing[2], letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4], gap: spacing[3] },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
});
