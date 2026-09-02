import { z } from 'zod';
import { LIMITS } from '../constants/limits';

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(LIMITS.MIN_NAME_LENGTH, `Name must be at least ${LIMITS.MIN_NAME_LENGTH} characters`)
      .max(LIMITS.MAX_NAME_LENGTH, `Name must be at most ${LIMITS.MAX_NAME_LENGTH} characters`),
    email: z.string().email('Enter a valid email address'),
    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()]{8,15}$/, 'Enter a valid phone number'),
    password: z
      .string()
      .min(LIMITS.MIN_PASSWORD_LENGTH, `Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(LIMITS.MIN_PASSWORD_LENGTH, `Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`)
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  otp: z
    .string()
    .length(LIMITS.OTP_LENGTH, `Enter the ${LIMITS.OTP_LENGTH}-digit code`),
});

export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  streetAddress: z.string().min(5, 'Enter a valid street address'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'Enter a city'),
  state: z.string().min(2, 'Enter a state or province'),
  zipCode: z.string().min(3, 'Enter a valid postal code'),
  country: z.string().min(2, 'Enter a country'),
  instructions: z
    .string()
    .max(LIMITS.MAX_ADDRESS_NOTE_CHARS, `Max ${LIMITS.MAX_ADDRESS_NOTE_CHARS} characters`)
    .optional(),
  isDefault: z.boolean().optional(),
});

export const editProfileSchema = z.object({
  fullName: z
    .string()
    .min(LIMITS.MIN_NAME_LENGTH, `Name must be at least ${LIMITS.MIN_NAME_LENGTH} characters`)
    .max(LIMITS.MAX_NAME_LENGTH, `Name must be at most ${LIMITS.MAX_NAME_LENGTH} characters`),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{8,15}$/, 'Enter a valid phone number'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
