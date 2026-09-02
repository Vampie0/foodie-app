import React, { useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { useAppTheme } from '../../providers/ThemeProvider';
import { radius } from '../../theme/radius';
import { UI } from '../../constants/ui';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  style,
  circle = false,
}: SkeletonProps) {
  const theme = useAppTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: UI.SKELETON_ANIMATION_DURATION / 2 }),
        withTiming(1, { duration: UI.SKELETON_ANIMATION_DURATION / 2 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const br = circle ? (typeof width === 'number' ? width / 2 : 999) : (borderRadius ?? radius.sm);

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width as number,
          height: circle ? width as number : height,
          borderRadius: br,
          backgroundColor: theme.isDark ? '#2A2A2A' : '#EBEBEB',
        },
        style,
      ]}
    />
  );
}

// Prebuilt skeleton layouts
export function TextSkeleton({ lines = 3, style }: { lines?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.textSkeleton, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginBottom: 8 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  textSkeleton: {
    gap: 8,
  },
});
