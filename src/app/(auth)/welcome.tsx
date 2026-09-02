import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../providers/ThemeProvider';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { spacing } from '../../theme/spacing';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Hero section */}
      <View style={[styles.hero, { backgroundColor: theme.colors.surfaceSubtle }]}>
        <View style={styles.heroContent}>
          <View style={[styles.logoMark, { backgroundColor: theme.colors.primary }]}>
            <AppText variant="display" color="#fff" weight="800" style={{ fontSize: 48 }}>
              🍽
            </AppText>
          </View>
          <AppText variant="display" color={theme.colors.text} weight="800" style={styles.appName}>
            FoodieApp
          </AppText>
          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.tagline}
          >
            Discover great food from your favourite restaurants
          </AppText>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing[6] }]}>
        <Button
          label="Get Started"
          variant="primary"
          size="large"
          onPress={() => router.push('/(auth)/register')}
          accessibilityLabel="Get Started — Create an account"
        />
        <Button
          label="Sign In"
          variant="outline"
          size="large"
          onPress={() => router.push('/(auth)/login')}
          accessibilityLabel="Sign in to existing account"
        />
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          align="center"
          style={styles.legal}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing[4],
  },
  logoMark: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  appName: {
    letterSpacing: -1,
  },
  tagline: {
    lineHeight: 24,
    maxWidth: 280,
  },
  actions: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    gap: spacing[3],
  },
  legal: {
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
  },
});
