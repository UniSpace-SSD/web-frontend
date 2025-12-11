import type { PageLoad } from './$types';
import { api, type Reservation } from '$lib/services/api';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const ssr = false;

export const load: PageLoad = async () => {
	if (!browser) {
		return { reservations: [] as Reservation[] };
	}

	const token = localStorage.getItem('auth_token');

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
