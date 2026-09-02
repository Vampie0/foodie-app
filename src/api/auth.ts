import { mockApiCall, mockDelay } from './mockDelay';
import { storeTokens, clearTokens } from './client';
import { User, AuthTokens } from '../types/user';
import { DUMMY_USER } from '../lib/dummyData';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return mockApiCall(() => {
      const user: User = {
        ...DUMMY_USER,
        id: `user-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        isEmailVerified: false,
        isPhoneVerified: false,
        createdAt: new Date().toISOString(),
      };
      const tokens: AuthTokens = {
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000,
      };
      return { user, tokens };
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return mockApiCall(() => {
      // Mock: any well-formed login succeeds
      const tokens: AuthTokens = {
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000,
      };
      return { user: DUMMY_USER, tokens };
    });
  },

  async verifyEmail(otp: string): Promise<{ success: boolean }> {
    await mockDelay();
    // Mock: any 6-digit OTP passes
    if (otp.length === 6) {
      return { success: true };
    }
    throw new Error('Invalid OTP');
  },

  async resendVerificationEmail(email: string): Promise<{ success: boolean }> {
    return mockApiCall(() => ({ success: true }));
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return mockApiCall(() => ({ success: true }));
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    return mockApiCall(() => ({ success: true }));
  },

  async logout(): Promise<void> {
    await mockDelay(200, 500);
    await clearTokens();
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return mockApiCall(() => ({
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000,
    }));
  },

  async getProfile(): Promise<User> {
    return mockApiCall(() => DUMMY_USER);
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    return mockApiCall(() => ({ ...DUMMY_USER, ...payload }));
  },
};
