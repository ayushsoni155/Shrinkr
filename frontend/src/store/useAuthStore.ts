import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    pendingEmail: string | null; // email awaiting OTP verification

    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setPendingEmail: (email: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            pendingEmail: null,

            setAuth: (user, accessToken, refreshToken) =>
                set({ user, accessToken, refreshToken, isAuthenticated: true, pendingEmail: null }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            setPendingEmail: (email) => set({ pendingEmail: email }),

            logout: () =>
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, pendingEmail: null }),
        }),
        {
            name: 'shrinkr-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
