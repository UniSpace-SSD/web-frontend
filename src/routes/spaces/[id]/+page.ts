import type { PageLoad } from './$types';
import { api } from '$lib/services/api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }: { params: { id: string } }) => {
    try {
        const space = await api.getSpace(params.id);
        return { space };
    } catch (err) {
        console.error('Error loading space:', err);
        throw error(404, 'Space not found');
    }
};
