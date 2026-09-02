import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from '../ui/AppText';
import { AppImage } from '../ui/AppImage';
import { Deal } from '../../types/restaurant';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface DealCardProps {
  deal: Deal;
  onPress?: (deal: Deal) => void;
  width?: number;
}

export function DealCard({ deal, onPress, width = 280 }: DealCardProps) {
  const theme = useAppTheme();

  const badgeText = () => {
    switch (deal.type) {
      case 'percentage': return `${deal.value}% OFF`;
      case 'fixed': return `Save ${deal.value}`;
      case 'free_delivery': return 'Free Delivery';
      case 'bogo': return 'BOGO';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width, backgroundColor: theme.colors.surface }]}
      onPress={() => onPress?.(deal)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Deal: ${deal.title}. ${deal.description}`}
      activeOpacity={0.9}
    >
      {/* Image */}
      {deal.image && (
        <AppImage
          source={{ uri: deal.image }}
          width={width}
          height={130}
          borderRadius={0}
          style={{ width, height: 130 }}
          containerStyle={{ borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' }}
        />
      )}

      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
        <AppText variant="caption" color={theme.colors.onPrimary} weight="700">
          {badgeText()}
        </AppText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AppText variant="titleSmall" color={theme.colors.text} weight="700" numberOfLines={1}>
          {deal.title}
        </AppText>
        <AppText variant="small" color={theme.colors.textSecondary} numberOfLines={2} style={styles.desc}>
          {deal.description}
        </AppText>
        {deal.couponCode && (
          <View style={[styles.couponRow, { backgroundColor: theme.colors.primaryContainer }]}>
            <AppText variant="caption" color={theme.colors.primary} weight="700" style={{ letterSpacing: 1 }}>
              {deal.couponCode}
            </AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  content: {
    padding: spacing[4],
    gap: spacing[1],
  },
  desc: {
    lineHeight: 18,
  },
  couponRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
    marginTop: spacing[2],
  },
});
