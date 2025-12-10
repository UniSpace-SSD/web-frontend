import type { PageLoad } from './$types';
import { api, type Reservation } from '$lib/services/api';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
        throw redirect(302, '/auth/login');
    }

    try {
        const reservations = await api.getMyReservations();
        return { reservations };
    } catch (error) {
        console.error('Error loading reservations:', error);
        return { reservations: [] as Reservation[] };
    }
};
