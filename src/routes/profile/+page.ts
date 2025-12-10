import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            throw redirect(302, '/auth/login');
        }
    }

    return {};
};
