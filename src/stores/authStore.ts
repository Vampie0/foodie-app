import { create } from 'zustand';
import { User } from '../types/user';
import { storeTokens, clearTokens } from '../api/client';
import { authApi, AuthResponse } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;

  // Actions
  login: (response: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setPendingVerification: (email: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingVerificationEmail: null,

  login: async (response: AuthResponse) => {
    await storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
    set({
      user: response.user,
      isAuthenticated: true,
      error: null,
    });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      await clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        pendingVerificationEmail: null,
      });
    }
  },

  setUser: (user: User) => set({ user }),

  setPendingVerification: (email: string) =>
    set({ pendingVerificationEmail: email }),

  clearError: () => set({ error: null }),
}));
