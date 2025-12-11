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

function loadDepartmentFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_department');
}

function loadRoleFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role');
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
                    // Salva anche ruolo e dipartimento per accesso rapido
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
                    // Salva anche ruolo e dipartimento per accesso rapido
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
                // Token is invalid, clear everything
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
        },

        // Helper per ottenere il dipartimento corrente
        getDepartment(): string | null {
            if (typeof window === 'undefined') return null;
            
            const user = loadUserFromStorage();
            if (user?.department) {
                return user.department;
            }
            
            return loadDepartmentFromStorage();
        },

        // Helper per ottenere il ruolo corrente
        getRole(): string | null {
            if (typeof window === 'undefined') return null;
            
            const user = loadUserFromStorage();
            if (user?.role) {
                return user.role;
            }
            
            return loadRoleFromStorage();
        },

        // Aggiorna i dati utente nel localStorage quando ricevi nuovi dati
        updateUserData(userData: Partial<User>) {
            if (typeof window === 'undefined') return;

            const currentUserStr = localStorage.getItem('user');
            if (currentUserStr) {
                try {
                    const currentUser = JSON.parse(currentUserStr);
                    const updatedUser = { ...currentUser, ...userData };
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    // Aggiorna anche i campi separati se presenti
                    if (userData.role) {
                        localStorage.setItem('user_role', userData.role);
                    }
                    if (userData.department) {
                        localStorage.setItem('user_department', userData.department);
                    }

                    // Aggiorna lo store
                    update(state => ({
                        ...state,
                        user: updatedUser,
                    }));
                } catch (error) {
                    console.error('Error updating user data:', error);
                }
            }
        },

        // Ottieni la lista dei dipartimenti
        async getDepartments(): Promise<{code: string, name: string}[]> {
            try {
                return await api.getDepartments();
            } catch (error) {
                console.error('Error fetching departments:', error);
                return [];
            }
        },

        // Verifica se l'utente ha i permessi per una risorsa specifica
        hasPermission(requiredRole?: 'student' | 'professor', requiredDepartment?: string): boolean {
            const currentUser = loadUserFromStorage();
            const userRole = this.getRole();
            const userDepartment = this.getDepartment();

            if (requiredRole && userRole !== requiredRole) {
                return false;
            }

            if (requiredDepartment && userDepartment !== requiredDepartment) {
                return false;
            }

            return true;
        },

        // Verifica se l'utente è un amministratore
        isUserAdmin(): boolean {
            const user = loadUserFromStorage();
            const role = this.getRole();
            
            return user?.is_superuser === true || role === 'professor';
        }
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
        if (!$auth.user) return false;
        
        // Controlla il ruolo dall'utente nello store
        if ($auth.user.role === 'professor' || $auth.user.is_superuser) {
            return true;
        }

        // Fallback al localStorage
        if (typeof window !== 'undefined') {
            const userRole = localStorage.getItem('user_role');
            return userRole === 'professor';
        }

        return false;
    }
);

// Nuovo derived store per il dipartimento
export const userDepartment = derived(
    authStore,
    $auth => {
        if ($auth.user?.department) {
            return $auth.user.department;
        }

        if (typeof window !== 'undefined') {
            return localStorage.getItem('user_department');
        }

        return null;
    }
);

// Nuovo derived store per il ruolo
export const userRole = derived(
    authStore,
    $auth => {
        if ($auth.user?.role) {
            return $auth.user.role;
        }

        if (typeof window !== 'undefined') {
            return localStorage.getItem('user_role');
        }

        return null;
    }
);

// Helper per verificare se l'utente appartiene a un dipartimento specifico
export const isInDepartment = (departmentCode: string) => {
    return derived(
        authStore,
        $auth => {
            const dept = $auth.user?.department || 
                        (typeof window !== 'undefined' ? localStorage.getItem('user_department') : null);
            return dept === departmentCode;
        }
    );
};

// Helper per verificare i permessi dell'utente
export const hasPermission = (requiredRole?: 'student' | 'professor', requiredDepartment?: string) => {
    return derived(
        authStore,
        $auth => {
            if (!$auth.user) return false;

            const userRole = $auth.user.role;
            const userDepartment = $auth.user.department;

            if (requiredRole && userRole !== requiredRole) {
                return false;
            }

            if (requiredDepartment && userDepartment !== requiredDepartment) {
                return false;
            }

            return true;
        }
    );
};

// Helper per verificare se l'utente può modificare una risorsa
export const canModifyResource = (resourceDepartment?: string) => {
    return derived(
        authStore,
        $auth => {
            if (!$auth.user) return false;
            
            // Gli admin (professori) possono modificare qualsiasi risorsa
            if ($auth.user.role === 'professor' || $auth.user.is_superuser) {
                return true;
            }
            
            // Gli studenti possono modificare solo risorse del loro dipartimento
            if (resourceDepartment && $auth.user.department === resourceDepartment) {
                return true;
            }
            
            return false;
        }
    );
};