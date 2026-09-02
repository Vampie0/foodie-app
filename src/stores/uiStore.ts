import { create } from 'zustand';

type ColorScheme = 'light' | 'dark' | 'system';

interface UIState {
  colorScheme: ColorScheme;
  isOnline: boolean;
  activeOrderId: string | null;

  setColorScheme: (scheme: ColorScheme) => void;
  setOnline: (online: boolean) => void;
  setActiveOrderId: (id: string | null) => void;
}

export const useUIStore = create<UIState>(set => ({
  colorScheme: 'system',
  isOnline: true,
  activeOrderId: null,

  setColorScheme: (colorScheme: ColorScheme) => set({ colorScheme }),
  setOnline: (isOnline: boolean) => set({ isOnline }),
  setActiveOrderId: (activeOrderId: string | null) => set({ activeOrderId }),
}));
