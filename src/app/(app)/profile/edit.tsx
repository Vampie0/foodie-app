import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../providers/ThemeProvider';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Avatar } from '../../../components/ui/AppImage';
import { useToast } from '../../../components/ui/Toast';
import { useAuthStore } from '../../../stores/authStore';
import { authApi } from '../../../api/auth';
import { editProfileSchema, EditProfileFormData } from '../../../utils/validation';
import { normalizeError } from '../../../utils/error';
import { spacing } from '../../../theme/spacing';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const toast = useToast();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: user?.fullName ?? '', phone: user?.phone ?? '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const updated = await authApi.updateProfile(data);
      setUser(updated);
      toast.success('Profile updated');
      router.back();
    } catch (err) {
      toast.error('Update failed', normalizeError(err).userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing[3], borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <AppText color={theme.colors.primary} variant="labelLarge">← Back</AppText>
        </TouchableOpacity>
        <AppText variant="titleSmall" color={theme.colors.text} weight="600">Edit Profile</AppText>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? 'U')}&background=FF6B35&color=fff&size=192` }}
            size={96}
          />
          <AppText variant="label" color={theme.colors.primary} weight="600">Change Photo</AppText>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          {/* Read-only email */}
          <Input
            label="Email"
            value={user?.email ?? ''}
            editable={false}
            disabled
            hint="Email cannot be changed"
          />
        </View>

        <Button
          label="Save Changes"
          variant="primary"
          size="large"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
  },
  content: { padding: spacing[5], gap: spacing[5] },
  avatarSection: { alignItems: 'center', gap: spacing[3] },
  form: { gap: spacing[4] },
  saveBtn: { marginTop: spacing[2] },
});
