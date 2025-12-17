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
					if (user.role) {
						localStorage.setItem('user_role', user.role);
					}
					if (user.department) {
						localStorage.setItem('user_department', user.department);
					}
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
				localStorage.removeItem('user_role');
				localStorage.removeItem('user_department');
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
					if (user.role) {
						localStorage.setItem('user_role', user.role);
					}
					if (user.department) {
						localStorage.setItem('user_department', user.department);
					}
				}

				update(state => ({
					...state,
					user,
					isAuthenticated: true,
					isLoading: false,
				}));
			} catch (error) {
				if (typeof window !== 'undefined') {
					localStorage.removeItem('user');
					localStorage.removeItem('user_role');
					localStorage.removeItem('user_department');
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
		}
	};
}

export const authStore = createAuthStore();

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
		if (!$auth.user) return false;

		if ($auth.user.is_superuser) {
			return true;
		}

		return false;
	}
);

export const canManageReservations = derived(
	authStore,
	$auth => {
		if (!$auth.user) return false;
		return $auth.user.role === 'professor' || $auth.user.is_superuser;
	}
);