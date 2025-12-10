import type { PageLoad } from './$types';
import { api, type Building } from '$lib/services/api';

export const load: PageLoad = async () => {
    try {
        const buildings = await api.getBuildings();
        return { buildings };
    } catch (error) {
        console.error('Error loading buildings:', error);
        return { buildings: [] as Building[] };
    }
};
