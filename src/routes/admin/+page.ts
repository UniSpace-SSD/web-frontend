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
			// Allow access if user is superuser (admin)
			if (user.is_superuser) {
				return {};
			}
		} catch {
			// Invalid JSON, redirect
		}
	}

	throw redirect(302, '/');
};
