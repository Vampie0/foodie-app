import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../utils/validation';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { control, handleSubmit, formState: { errors }, getValues } =
    useForm<ForgotPasswordFormData>({
      resolver: zodResolver(forgotPasswordSchema),
      mode: 'onBlur',
    });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmailSent(true);
    } catch {
      toast.error('Failed', 'Unable to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.successContainer, { paddingTop: insets.top + spacing[8] }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.successLight }]}>
            <AppText style={{ fontSize: 36 }}>✅</AppText>
          </View>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700" align="center">
            Check your email
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            We sent a reset link to{'\n'}
            <AppText variant="body" color={theme.colors.text} weight="600">
              {getValues('email')}
            </AppText>
          </AppText>
          <Button
            label="Back to Sign In"
            variant="primary"
            size="large"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backBtn}
          />
        </View>
      </View>
    );
  }

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>

        <View style={styles.header}>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700">
            Reset Password
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Enter your email and we'll send a reset link
          </AppText>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="ahmed@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              accessibilityLabel="Email address"
            />
          )}
        />

        <Button
          label="Send Reset Link"
          variant="primary"
          size="large"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
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
    gap: spacing[4],
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  header: {
    gap: spacing[2],
  },
  submitBtn: {
    marginTop: spacing[2],
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    gap: spacing[4],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  backBtn: {
    marginTop: spacing[4],
    width: '100%',
  },
});
