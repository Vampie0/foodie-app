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
import { useRestaurantStore } from '../../stores/restaurantStore';
import { loginSchema, LoginFormData } from '../../utils/validation';
import { spacing } from '../../theme/spacing';
import { normalizeError } from '../../utils/error';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const { login } = useAuthStore();
  const currentRestaurant = useRestaurantStore(s => s.currentRestaurant);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      await login(response);

      if (currentRestaurant) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(auth)/restaurant-selection');
      }
    } catch (err) {
      const error = normalizeError(err);
      toast.error('Sign in failed', error.userMessage);
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
            Welcome back
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Sign in to continue your order
          </AppText>
        </View>

        <View style={styles.form}>
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
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Email address"
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
                placeholder="Your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
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

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            accessible
            accessibilityRole="link"
            accessibilityLabel="Forgot password"
            style={styles.forgotLink}
          >
            <AppText variant="label" color={theme.colors.primary} weight="600">
              Forgot password?
            </AppText>
          </TouchableOpacity>
        </View>

        <Button
          label="Sign In"
          variant="primary"
          size="large"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
          accessibilityLabel="Sign in"
        />

        <Divider label="or" style={styles.divider} />

        <View style={styles.signupRow}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Don't have an account?{' '}
          </AppText>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/register')}
            accessible
            accessibilityRole="link"
          >
            <AppText variant="body" color={theme.colors.primary} weight="600">
              Create Account
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
  form: {
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -spacing[2],
  },
  submitBtn: {
    marginBottom: spacing[4],
  },
  divider: {
    marginVertical: spacing[3],
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
  },
});
