import React, { useRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { dimensions } from '../../theme/dimensions';
import { radius } from '../../theme/radius';
import { duration } from '../../theme/motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  label: string;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  label,
  onPress,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const lastPressTime = useRef(0);

  const isDisabled = disabled || loading;

  // Prevent double tap
  const handlePress = () => {
    const now = Date.now();
    if (now - lastPressTime.current < 800) return;
    lastPressTime.current = now;
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: duration.fast });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: duration.normal });
  };

  const getContainerStyle = (): ViewStyle => {
    const heightMap = {
      small: dimensions.buttonSmall,
      medium: dimensions.buttonMedium,
      large: dimensions.buttonLarge,
    };

    const paddingMap = {
      small: { paddingHorizontal: 12 },
      medium: { paddingHorizontal: 20 },
      large: { paddingHorizontal: 24 },
    };

    const radiusMap = {
      small: radius.sm,
      medium: radius.md,
      large: radius.lg,
    };

    const bgMap: Record<ButtonVariant, string> = {
      primary: theme.colors.primary,
      secondary: theme.colors.surface,
      outline: 'transparent',
      ghost: 'transparent',
      danger: theme.colors.error,
    };

    const borderMap: Record<ButtonVariant, string | undefined> = {
      primary: undefined,
      secondary: theme.colors.border,
      outline: theme.colors.primary,
      ghost: undefined,
      danger: undefined,
    };

    return {
      height: heightMap[size],
      borderRadius: radiusMap[size],
      backgroundColor: isDisabled ? theme.colors.disabled : bgMap[variant],
      borderWidth: borderMap[variant] ? 1.5 : 0,
      borderColor: borderMap[variant],
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      alignSelf: fullWidth ? 'stretch' : 'auto',
      opacity: isDisabled ? 0.6 : 1,
      ...paddingMap[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const colorMap: Record<ButtonVariant, string> = {
      primary: theme.colors.onPrimary,
      secondary: theme.colors.text,
      outline: theme.colors.primary,
      ghost: theme.colors.primary,
      danger: '#FFFFFF',
    };

    const sizeMap = {
      small: 13 as const,
      medium: 15 as const,
      large: 16 as const,
    };

    return {
      color: isDisabled ? 'rgba(255,255,255,0.8)' : colorMap[variant],
      fontSize: sizeMap[size],
      fontWeight: '600',
      letterSpacing: 0.2,
    };
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={1}
      {...rest}
    >
      <View style={getContainerStyle()}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary}
          />
        ) : (
          <>
            {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
            <AppText style={getTextStyle()} variant={size === 'small' ? 'label' : 'labelLarge'}>
              {label}
            </AppText>
            {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
          </>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
