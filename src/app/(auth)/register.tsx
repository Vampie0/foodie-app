import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
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
import { Divider } from '../../components/ui/Divider';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import {
  registerSchema,
  RegisterFormData,
} from '../../utils/validation';
import { spacing } from '../../theme/spacing';
import { normalizeError } from '../../utils/error';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const { login, setPendingVerification } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      await login(response);
      setPendingVerification(data.email);
      router.replace('/(auth)/verify-email');
    } catch (err) {
      const error = normalizeError(err);
      toast.error('Registration failed', error.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[6] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>

        <View style={styles.header}>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700">
            Create Account
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Join us for great food delivered fast
          </AppText>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="Ahmed Raza"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                accessibilityLabel="Full Name"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={emailRef}
                label="Email"
                placeholder="ahmed@example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                accessibilityLabel="Email address"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={phoneRef}
                label="Phone Number"
                placeholder="+92-300-1234567"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Phone number"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordRef}
                label="Password"
                placeholder="Min. 8 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                accessibilityLabel="Password"
                rightAction={
                  <TouchableOpacity
                    onPress={() => setShowPassword(v => !v)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
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
                placeholder="Repeat your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showConfirm}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                accessibilityLabel="Confirm password"
                rightAction={
                  <TouchableOpacity
                    onPress={() => setShowConfirm(v => !v)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
                  >
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
          label="Create Account"
          variant="primary"
          size="large"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
          accessibilityLabel="Create account"
        />

        <Divider label="or" style={styles.divider} />

        <View style={styles.loginRow}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Already have an account?{' '}
          </AppText>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            accessible
            accessibilityRole="link"
            accessibilityLabel="Sign in"
          >
            <AppText variant="body" color={theme.colors.primary} weight="600">
              Sign In
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    flexGrow: 1,
  },
  backBtn: {
    marginBottom: spacing[4],
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  subtitle: {
    lineHeight: 22,
  },
  form: {
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  submitBtn: {
    marginBottom: spacing[4],
  },
  divider: {
    marginVertical: spacing[3],
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
  },
});
