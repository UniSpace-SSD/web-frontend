import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async () => {
    if (typeof window !== 'undefined') {
        const userRole = localStorage.getItem('user_role');

        if (userRole !== 'professor') {
            throw redirect(302, '/');
        }
    }

    return {};
};
