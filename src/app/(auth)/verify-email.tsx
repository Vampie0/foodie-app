import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { LIMITS } from '../../constants/limits';

const OTP_LENGTH = LIMITS.OTP_LENGTH;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const { pendingVerificationEmail, setUser } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(v => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) return;
    setIsLoading(true);
    try {
      await authApi.verifyEmail(otp);
      setUser({ ...useAuthStore.getState().user!, isEmailVerified: true });
      toast.success('Email verified!', 'Your account is ready');
      router.replace('/(auth)/restaurant-selection');
    } catch (err) {
      toast.error('Invalid code', 'Please check the code and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !pendingVerificationEmail) return;
    try {
      await authApi.resendVerificationEmail(pendingVerificationEmail);
      setResendCountdown(60);
      toast.success('Code sent!', `Check ${pendingVerificationEmail}`);
    } catch {
      toast.error('Failed to resend', 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing[6], paddingBottom: insets.bottom + spacing[6] },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <AppText style={{ fontSize: 32 }}>✉️</AppText>
          </View>
          <AppText variant="titleLarge" color={theme.colors.text} weight="700" align="center">
            Verify your email
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            We've sent a 6-digit code to{'\n'}
            <AppText variant="body" color={theme.colors.text} weight="600">
              {pendingVerificationEmail ?? 'your email'}
            </AppText>
          </AppText>
        </View>

        {/* Hidden full input, rendered OTP boxes over it */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.otpContainer}
          accessible
          accessibilityLabel="Enter 6-digit verification code"
          accessibilityRole="none"
        >
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={text => {
              const clean = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
              setOtp(clean);
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={styles.hiddenInput}
            autoFocus
            caretHidden
          />
          <View style={styles.otpBoxes}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  {
                    borderColor:
                      otp.length === i
                        ? theme.colors.primary
                        : otp.length > i
                        ? theme.colors.primary
                        : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    borderWidth: otp.length === i ? 2 : 1.5,
                  },
                ]}
              >
                <AppText variant="title" color={theme.colors.text} weight="700">
                  {otp[i] ?? ''}
                </AppText>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <Button
          label="Verify Email"
          variant="primary"
          size="large"
          loading={isLoading}
          disabled={otp.length !== OTP_LENGTH}
          onPress={handleVerify}
          style={styles.verifyBtn}
          accessibilityLabel="Verify email with code"
        />

        <View style={styles.resendRow}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Didn't receive the code?{' '}
          </AppText>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCountdown > 0}
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              resendCountdown > 0
                ? `Resend code in ${resendCountdown} seconds`
                : 'Resend code'
            }
          >
            <AppText
              variant="body"
              color={resendCountdown > 0 ? theme.colors.textMuted : theme.colors.primary}
              weight="600"
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
            </AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/restaurant-selection')}
          style={styles.skipBtn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Skip verification for now"
        >
          <AppText variant="label" color={theme.colors.textMuted}>
            Skip for now
          </AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[5],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  otpContainer: {
    width: '100%',
    marginBottom: spacing[6],
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtn: {
    width: '100%',
    marginBottom: spacing[4],
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipBtn: {
    marginTop: spacing[4],
    padding: spacing[2],
  },
});
