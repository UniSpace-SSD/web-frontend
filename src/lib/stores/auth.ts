/**
 * Authentication Store
 * Manages user authentication state
 */

import { writable, derived } from 'svelte/store';
import { api, type User, type LoginRequest, type RegisterRequest } from '$lib/services/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

function loadUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            return JSON.parse(storedUser);
        } catch {
            return null;
        }
    }
    return null;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>({
        ...initialState,
        user: loadUserFromStorage(),
        isAuthenticated: !!loadUserFromStorage(),
        isLoading: false,
    });

    return {
        subscribe,

        async login(credentials: LoginRequest) {
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                await api.login(credentials);
                const user = await api.getCurrentUser();

                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(user));
                }

                update(state => ({
                    ...state,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                }));

                return user;
            } catch (error: any) {
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: error.message || 'Login failed',
                }));
                throw error;
            }
        },

        async register(data: RegisterRequest) {
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                await api.register(data);
                update(state => ({ ...state, isLoading: false, error: null }));
            } catch (error: any) {
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: error.message || 'Registration failed',
                }));
                throw error;
            }
        },

        async logout() {
            try {
                await api.logout();
            } catch (error) {
                console.error('Logout error:', error);
            }

            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
            }

            set({
                ...initialState,
                isLoading: false,
            });
        },

        async checkAuth() {
            const token = api.getToken();

            if (!token) {
                update(state => ({ ...state, isLoading: false }));
                return;
            }

            try {
                const user = await api.getCurrentUser();

                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(user));
                }

                update(state => ({
                    ...state,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                }));
            } catch (error) {
                // Token is invalid, clear everything
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                }
                api.setToken(null);

                set({
                    ...initialState,
                    isLoading: false,
                });
            }
        },

        clearError() {
            update(state => ({ ...state, error: null }));
        },
    };
}

export const authStore = createAuthStore();

// Derived stores
export const isAuthenticated = derived(
    authStore,
    $auth => $auth.isAuthenticated
);

export const currentUser = derived(
    authStore,
    $auth => $auth.user
);

export const isAdmin = derived(
    authStore,
    $auth => {
        // Check if user has 'professor' role or is admin
        if (!$auth.user) return false;

        // For now, we'll check localStorage for role since the User type
        // doesn't include role in the response. In a real app, you'd want
        // to store this in the user object or check permissions differently
        if (typeof window !== 'undefined') {
            const userRole = localStorage.getItem('user_role');
            return userRole === 'professor';
        }

        return false;
    }
);
