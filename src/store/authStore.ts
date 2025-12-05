import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User, RegisterCredentials } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    register: (data: RegisterCredentials) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token, isAuthenticated: true });
            },
            register: async (data) => {
                // Register the user (backend doesn't return token)
                await authService.register(data);
                // Automatically log in to get the token
                const loginResponse = await authService.login({
                    email: data.email,
                    password: data.password,
                });
                localStorage.setItem('token', loginResponse.token);
                set({ user: loginResponse.user, token: loginResponse.token, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },
            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
