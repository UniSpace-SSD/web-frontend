import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const ssr = false;

export const load: PageLoad = async () => {
	if (!browser) {
		return {};
	}

	const token = localStorage.getItem('auth_token');

	if (!token) {
		throw redirect(302, '/auth/login');
	}

	return {};
};
