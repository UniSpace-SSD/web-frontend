/**
 * Theme Store
 * Manages dark/light theme preference
 */

import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function loadThemeFromStorage(): Theme {
    if (typeof window === 'undefined') return 'light';

    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
        return storedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

function createThemeStore() {
    const { subscribe, set, update } = writable<Theme>(loadThemeFromStorage());

    return {
        subscribe,

        setTheme(theme: Theme) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', theme);
                document.documentElement.setAttribute('data-theme', theme);
            }
            set(theme);
        },

        toggle() {
            update(current => {
                const newTheme = current === 'light' ? 'dark' : 'light';

                if (typeof window !== 'undefined') {
                    localStorage.setItem('theme', newTheme);
                    document.documentElement.setAttribute('data-theme', newTheme);
                }

                return newTheme;
            });
        },

        initialize() {
            const theme = loadThemeFromStorage();

            if (typeof window !== 'undefined') {
                document.documentElement.setAttribute('data-theme', theme);
            }

            set(theme);
        },
    };
}

export const themeStore = createThemeStore();
