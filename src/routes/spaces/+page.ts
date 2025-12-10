import type { PageLoad } from './$types';
import { api, type Space } from '$lib/services/api';

export const load: PageLoad = async () => {
    try {
        const spaces = await api.getSpaces();
        return { spaces };
    } catch (error) {
        console.error('Error loading spaces:', error);
        return { spaces: [] as Space[] };
    }
};
