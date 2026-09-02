import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { radius } from '../../theme/radius';
import { LIMITS } from '../../constants/limits';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = LIMITS.MAX_ITEM_QUANTITY,
  size = 'medium',
  disabled = false,
}: QuantitySelectorProps) {
  const theme = useAppTheme();

  const sizeMap = {
    small: { btnSize: 28, fontSize: 13, gap: 8 },
    medium: { btnSize: 36, fontSize: 15, gap: 12 },
    large: { btnSize: 44, fontSize: 17, gap: 16 },
  };

  const { btnSize, fontSize, gap } = sizeMap[size];

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const isDecDisabled = disabled || value <= min;
  const isIncDisabled = disabled || value >= max;

  const btnStyle = {
    width: btnSize,
    height: btnSize,
    borderRadius: radius.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  };

  return (
    <View style={[styles.container, { gap }]}>
      <TouchableOpacity
        style={[btnStyle, isDecDisabled && styles.disabled]}
        onPress={handleDecrement}
        disabled={isDecDisabled}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Decrease quantity, current ${value}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppText
          style={{ fontSize: fontSize + 2, lineHeight: fontSize + 4 }}
          color={isDecDisabled ? theme.colors.textMuted : theme.colors.text}
          weight="600"
        >
          −
        </AppText>
      </TouchableOpacity>

      <AppText
        style={{ fontSize, minWidth: 24, textAlign: 'center' }}
        color={theme.colors.text}
        weight="600"
      >
        {value}
      </AppText>

      <TouchableOpacity
        style={[
          btnStyle,
          { backgroundColor: isIncDisabled ? theme.colors.surfaceSubtle : theme.colors.primary },
          isIncDisabled && styles.disabled,
        ]}
        onPress={handleIncrement}
        disabled={isIncDisabled}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Increase quantity, current ${value}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppText
          style={{ fontSize: fontSize + 2, lineHeight: fontSize + 4 }}
          color={isIncDisabled ? theme.colors.textMuted : theme.colors.onPrimary}
          weight="600"
        >
          +
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
