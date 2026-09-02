import React, { useRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../providers/ThemeProvider';
import { dimensions } from '../../theme/dimensions';
import { radius } from '../../theme/radius';
import { duration } from '../../theme/motion';

type IconButtonVariant = 'default' | 'filled' | 'tinted' | 'outline' | 'ghost';
type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  accessibilityLabel: string;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function IconButton({
  icon,
  variant = 'default',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  onPress,
  style,
  ...rest
}: IconButtonProps) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const lastPressTime = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPressTime.current < 300) return;
    lastPressTime.current = now;
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeMap: Record<IconButtonSize, number> = {
    small: 32,
    medium: dimensions.touchTargetMin,
    large: dimensions.touchTargetLarge,
  };

  const containerSize = sizeMap[size];

  const bgMap: Record<IconButtonVariant, string> = {
    default: 'transparent',
    filled: theme.colors.primary,
    tinted: theme.colors.primaryContainer,
    outline: 'transparent',
    ghost: 'transparent',
  };

  const containerStyle: ViewStyle = {
    width: containerSize,
    height: containerSize,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: disabled ? 'transparent' : bgMap[variant],
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: theme.colors.border,
    opacity: disabled ? 0.4 : 1,
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, style]}
      onPress={handlePress}
      onPressIn={() => { scale.value = withTiming(0.92, { duration: duration.fast }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: duration.normal }); }}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      activeOpacity={1}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...rest}
    >
      <View style={containerStyle}>{icon}</View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({});
