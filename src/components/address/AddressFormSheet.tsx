import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useAppTheme } from '../../providers/ThemeProvider';
import { BottomSheet } from '../ui/BottomSheet';
import { AppText } from '../ui/AppText';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { addressesApi } from '../../api/addresses';
import { queryClient } from '../../providers/QueryProvider';
import { queryKeys } from '../../queries/queryKeys';
import { addressSchema, AddressFormData } from '../../utils/validation';
import { Address } from '../../types/user';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface AddressFormSheetProps {
  visible: boolean;
  onClose: () => void;
  editingAddress?: Address | null;
}

const LABELS: { key: 'home' | 'work' | 'other'; icon: string; label: string }[] = [
  { key: 'home', icon: '🏠', label: 'Home' },
  { key: 'work', icon: '🏢', label: 'Work' },
  { key: 'other', icon: '📍', label: 'Other' },
];

export default function AddressFormSheet({ visible, onClose, editingAddress }: AddressFormSheetProps) {
  const theme = useAppTheme();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: editingAddress
      ? {
          label: editingAddress.label,
          streetAddress: editingAddress.streetAddress,
          apartment: editingAddress.apartment,
          city: editingAddress.city,
          state: editingAddress.state,
          zipCode: editingAddress.zipCode,
          country: editingAddress.country,
          instructions: editingAddress.instructions,
          isDefault: editingAddress.isDefault,
        }
      : { label: 'home', country: 'Pakistan', isDefault: false },
  });

  const selectedLabel = watch('label');

  const addMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      addressesApi.addAddress({
        ...data,
        label: data.label as Address['label'],
        isDefault: data.isDefault ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses() });
      toast.success('Address saved');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to save address'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      addressesApi.updateAddress(editingAddress!.id, {
        ...data,
        label: data.label as Address['label'],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses() });
      toast.success('Address updated');
      onClose();
    },
    onError: () => toast.error('Failed to update address'),
  });

  const isEditing = Boolean(editingAddress);
  const isPending = addMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: AddressFormData) => {
    if (isEditing) updateMutation.mutate(data);
    else addMutation.mutate(data);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Address' : 'Add Address'}
      scrollable
    >
      <View style={styles.form}>
        {/* Label selector */}
        <View style={styles.labelRow}>
          {LABELS.map(l => (
            <TouchableOpacity
              key={l.key}
              style={[
                styles.labelBtn,
                {
                  borderColor: selectedLabel === l.key ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selectedLabel === l.key ? theme.colors.primaryContainer : theme.colors.surface,
                },
              ]}
              onPress={() => setValue('label', l.key)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedLabel === l.key }}
              accessibilityLabel={l.label}
            >
              <AppText style={{ fontSize: 18 }}>{l.icon}</AppText>
              <AppText
                variant="label"
                color={selectedLabel === l.key ? theme.colors.primary : theme.colors.text}
                weight={selectedLabel === l.key ? '600' : '400'}
              >
                {l.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <Controller control={control} name="streetAddress"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Street Address" placeholder="House #, Street, Area" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.streetAddress?.message} />
          )}
        />
        <Controller control={control} name="apartment"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Apartment / Unit (optional)" placeholder="Flat 4B, Floor 2..." value={value ?? ''} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller control={control} name="city"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="City" placeholder="Islamabad" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.city?.message} />
          )}
        />
        <Controller control={control} name="state"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="State / Province" placeholder="Punjab" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.state?.message} />
          )}
        />
        <Controller control={control} name="zipCode"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="ZIP / Postal Code" placeholder="44000" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.zipCode?.message} keyboardType="number-pad" />
          )}
        />
        <Controller control={control} name="instructions"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Delivery Instructions (optional)" placeholder="Ring doorbell, leave at door..." value={value ?? ''} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <Button
          label={isEditing ? 'Update Address' : 'Save Address'}
          variant="primary"
          size="large"
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: spacing[2] }}
        />
        <Button
          label="Cancel"
          variant="ghost"
          size="medium"
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4], paddingBottom: spacing[4] },
  labelRow: { flexDirection: 'row', gap: spacing[3] },
  labelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
  },
});
