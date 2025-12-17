import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const ssr = false;

export const load: PageLoad = async () => {
	if (!browser) {
		return {};
	}

	const storedUser = localStorage.getItem('user');

	if (storedUser) {
		try {
			const user = JSON.parse(storedUser);
			// Permetti l'accesso solo se l'utente è superuser (admin)
			if (user.is_superuser) {
				return {};
			}
		} catch {
			// JSON non valido, reindirizza
		}
	}

	throw redirect(302, '/');
};