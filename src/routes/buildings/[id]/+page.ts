import type { PageLoad } from './$types';
import { api, type Space } from '$lib/services/api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }: { params: { id: string } }) => {
    try {
        const building = await api.getBuilding(params.id);

        let spaces: Space[] = [];
        try {
            const allSpaces = await api.getSpaces();
            spaces = allSpaces.filter(space => space.building?.id === params.id);
        } catch (spacesError) {
            console.error('Error loading spaces:', spacesError);
        }

        return { building, spaces };
    } catch (err) {
        console.error('Error loading building:', err);
        throw error(404, 'Building not found');
    }
};
