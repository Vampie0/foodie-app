import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { duration } from '../../theme/motion';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { dimensions } from '../../theme/dimensions';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      rightAction,
      containerStyle,
      disabled = false,
      onFocus,
      onBlur,
      style,
      ...rest
    },
    ref
  ) => {
    const theme = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      focusAnim.value = withTiming(1, { duration: duration.normal });
      onFocus?.(e);
    };

    const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      focusAnim.value = withTiming(0, { duration: duration.normal });
      onBlur?.(e);
    };

    const borderColor = error
      ? theme.colors.error
      : isFocused
      ? theme.colors.primary
      : theme.colors.border;

    const borderWidth = isFocused || error ? 2 : 1.5;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && (
          <AppText
            variant="label"
            color={error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.label}
          >
            {label}
          </AppText>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor,
              borderWidth,
              backgroundColor: disabled
                ? theme.colors.surfaceSubtle
                : theme.colors.surface,
              height: dimensions.inputHeight,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: theme.colors.text,
                flex: 1,
              },
              style,
            ]}
            placeholderTextColor={theme.colors.textMuted}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </View>
        {error ? (
          <AppText variant="caption" color={theme.colors.error} style={styles.helper}>
            {error}
          </AppText>
        ) : hint ? (
          <AppText variant="caption" color={theme.colors.textMuted} style={styles.helper}>
            {hint}
          </AppText>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    overflow: 'hidden',
  },
  input: {
    fontSize: 15,
    fontWeight: '400',
    height: '100%',
    paddingVertical: 0,
    ...Platform.select({
      android: { paddingVertical: 0 },
    }),
  },
  leftIcon: {
    marginRight: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    marginLeft: spacing[2],
  },
  helper: {
    marginTop: 2,
  },
});
