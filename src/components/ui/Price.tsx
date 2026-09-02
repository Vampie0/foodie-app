import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { TypographyVariant } from '../../theme/typography';

interface PriceProps {
  amount: number;
  currency?: string;
  variant?: TypographyVariant;
  color?: string;
  originalAmount?: number;
  showOriginal?: boolean;
  weight?: '400' | '500' | '600' | '700' | '800';
}

export function Price({
  amount,
  currency = 'PKR',
  variant = 'titleSmall',
  color,
  originalAmount,
  showOriginal = false,
  weight = '700',
}: PriceProps) {
  const theme = useAppTheme();

  const formatted = formatPrice(amount, currency);
  const formattedOriginal = originalAmount ? formatPrice(originalAmount, currency) : null;

  return (
    <View style={styles.container}>
      <AppText
        variant={variant}
        color={color ?? theme.colors.text}
        weight={weight}
      >
        {formatted}
      </AppText>
      {showOriginal && formattedOriginal && (
        <AppText
          variant="small"
          color={theme.colors.textMuted}
          style={styles.strikethrough}
        >
          {formattedOriginal}
        </AppText>
      )}
    </View>
  );
}

export function formatPrice(amount: number, currency = 'PKR'): string {
  // Simple formatting without Intl to avoid RN issues
  const formatted = amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${formatted}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
