import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth';
import { resetPasswordSchema, ResetPasswordFormData } from '../../utils/validation';
import { spacing } from '../../theme/spacing';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const { token = '' } = useLocalSearchParams<{ token?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors } } =
    useForm<ResetPasswordFormData>({
      resolver: zodResolver(resetPasswordSchema),
      mode: 'onBlur',
    });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      toast.success('Password reset!', 'You can now sign in with your new password');
      router.replace('/(auth)/login');
    } catch {
      toast.error('Reset failed', 'Please request a new reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[6] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700">
            New Password
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Create a new strong password for your account
          </AppText>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="New Password"
                placeholder="Min. 8 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                accessibilityLabel="New password"
                rightAction={
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                    <AppText variant="label" color={theme.colors.primary}>
                      {showPassword ? 'Hide' : 'Show'}
                    </AppText>
                  </TouchableOpacity>
                }
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={confirmRef}
                label="Confirm Password"
                placeholder="Repeat your new password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                accessibilityLabel="Confirm new password"
                rightAction={
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                    <AppText variant="label" color={theme.colors.primary}>
                      {showConfirm ? 'Hide' : 'Show'}
                    </AppText>
                  </TouchableOpacity>
                }
              />
            )}
          />
        </View>

        <Button
          label="Reset Password"
          variant="primary"
          size="large"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing[5],
    flexGrow: 1,
    gap: spacing[5],
  },
  header: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
  form: {
    gap: spacing[4],
  },
});
