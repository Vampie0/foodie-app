import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from './AppText';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

interface SearchInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  autoFocus = false,
  style,
  ...rest
}: SearchInputProps) {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceSubtle,
          borderRadius: radius.lg,
          borderWidth: isFocused ? 1.5 : 1,
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      {/* Search icon (text fallback) */}
      <AppText color={theme.colors.textMuted} style={styles.searchIcon}>
        🔍
      </AppText>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        style={[
          styles.input,
          { color: theme.colors.text },
          style,
        ]}
        accessible
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        {...rest}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <View style={[styles.clearBtn, { backgroundColor: theme.colors.textMuted }]}>
            <AppText color="#fff" style={styles.clearIcon}>✕</AppText>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 10,
    lineHeight: 18,
  },
});
