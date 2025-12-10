import { writable } from 'svelte/store';

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

export interface Snackbar {
    id: string;
    message: string;
    severity: SnackbarSeverity;
    duration: number;
}

function createSnackbarStore() {
    const { subscribe, update } = writable<Snackbar[]>([]);

    return {
        subscribe,
        add: (message: string, severity: SnackbarSeverity = 'info', duration: number = 3000) => {
            const id = Math.random().toString(36).substring(2, 9);
            const snackbar: Snackbar = { id, message, severity, duration };

            update((snackbars) => [...snackbars, snackbar]);

            if (duration > 0) {
                setTimeout(() => {
                    update((snackbars) => snackbars.filter((s) => s.id !== id));
                }, duration);
            }

            return id;
        },
        remove: (id: string) => {
            update((snackbars) => snackbars.filter((s) => s.id !== id));
        },
        clear: () => {
            update(() => []);
        }
    };
}

export const snackbar = createSnackbarStore();
