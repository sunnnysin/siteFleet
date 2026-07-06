import { create } from 'zustand';
import type { UserProfile } from '@/types/user';

interface AuthState {
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  setUserProfile: (userProfile: UserProfile | null) => void;
  setAuthLoading: (isAuthLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  userProfile: null,
  isAuthLoading: true,
  setUserProfile: userProfile => set({ userProfile }),
  setAuthLoading: isAuthLoading => set({ isAuthLoading }),
}));
