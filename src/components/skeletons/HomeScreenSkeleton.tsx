import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { useAppTheme } from '../../providers/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export function HomeScreenSkeleton() {
  const theme = useAppTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerRow}>
          <Skeleton width={56} height={56} borderRadius={radius.lg} circle />
          <View style={styles.headerText}>
            <Skeleton width={160} height={20} />
            <Skeleton width={100} height={14} style={{ marginTop: 6 }} />
          </View>
          <Skeleton width={44} height={44} circle />
        </View>
        {/* Search bar */}
        <Skeleton width="100%" height={48} borderRadius={radius.lg} style={{ marginTop: spacing[4] }} />
      </View>

      {/* Banner deal */}
      <View style={styles.section}>
        <Skeleton width="100%" height={180} borderRadius={radius.xl} />
      </View>

      {/* Category chips */}
      <View style={styles.section}>
        <Skeleton width={120} height={20} style={{ marginBottom: spacing[3] }} />
        <View style={styles.chips}>
          {[80, 100, 72, 96, 88].map((w, i) => (
            <Skeleton key={i} width={w} height={36} borderRadius={radius.sm} />
          ))}
        </View>
      </View>

      {/* Menu items grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={130} height={20} />
          <Skeleton width={60} height={16} />
        </View>
        <View style={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
              <Skeleton width="100%" height={140} borderRadius={radius.lg} />
              <View style={styles.itemInfo}>
                <Skeleton width="80%" height={16} style={{ marginTop: spacing[2] }} />
                <Skeleton width="55%" height={13} style={{ marginTop: 6 }} />
                <Skeleton width="40%" height={18} style={{ marginTop: spacing[2] }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing[5],
    paddingBottom: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  section: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  itemCard: {
    width: '47%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  itemInfo: {
    padding: spacing[3],
  },
});
