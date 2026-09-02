import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { useAppTheme } from '../../providers/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export function MenuItemDetailSkeleton() {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Hero image */}
      <Skeleton width="100%" height={280} borderRadius={0} />

      <View style={styles.content}>
        {/* Name & meta */}
        <Skeleton width="75%" height={26} />
        <Skeleton width="50%" height={16} style={{ marginTop: spacing[2] }} />

        <View style={styles.metaRow}>
          <Skeleton width={70} height={30} borderRadius={radius.sm} />
          <Skeleton width={70} height={30} borderRadius={radius.sm} />
          <Skeleton width={70} height={30} borderRadius={radius.sm} />
        </View>

        {/* Variants */}
        <Skeleton width={120} height={20} style={{ marginTop: spacing[5] }} />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} width="100%" height={52} borderRadius={radius.md} style={{ marginTop: spacing[2] }} />
        ))}

        {/* Add-ons */}
        <Skeleton width={100} height={20} style={{ marginTop: spacing[5] }} />
        {[1, 2].map(i => (
          <Skeleton key={i} width="100%" height={52} borderRadius={radius.md} style={{ marginTop: spacing[2] }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
});
