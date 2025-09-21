import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Member, Organization } from '@/types';

interface AuthState {
  accessToken: string | null;
  userType: "MEMBER" | "ORGANIZATION" | null;
  userDetails: Member | Organization | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  setCredentials: (data: Pick<AuthState, "userType" | "userDetails">) => void;
  setAccessToken: (token: string) => void;
  clearCredentials: () => void;
  setLoading: (loading: boolean) => void;
  updateUserDetails: (userDetails: Member | Organization | null) => void;
  refreshToken: (token: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      accessToken: null,
      userType: "MEMBER",
      userDetails: null,
      isAuthenticated: false,
      loading: false,

      // Actions
      setCredentials: (data) =>
        set((state) => ({
          ...state,
          userType: data.userType,
          userDetails: data.userDetails,
          isAuthenticated: true,
        })),

      setAccessToken: (token) =>
        set((state) => ({
          ...state,
          accessToken: token,
        })),

      clearCredentials: () =>
        set(() => ({
          accessToken: null,
          userDetails: null,
          userType: null,
          isAuthenticated: false,
          loading: false,
        })),

      setLoading: (loading) =>
        set((state) => ({
          ...state,
          loading,
        })),

      updateUserDetails: (userDetails) =>
        set((state) => ({
          ...state,
          userDetails,
        })),

      refreshToken: (token) =>
        set((state) => ({
          ...state,
          accessToken: token,
        })),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        accessToken: state.accessToken,
        userType: state.userType,
        userDetails: state.userDetails,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 