<script lang="ts">
	import { api } from '$lib/services/api';
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import { snackbar } from '$lib/stores/snackbar';

	let buildings = $state([]);
	let spaces = $state([]);
	let reservations = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const [buildingsData, spacesData, reservationsData] = await Promise.all([
				api.getBuildings(),
				api.getSpaces(),
				api.getReservations()
			]);

			buildings = buildingsData;
			spaces = spacesData;
			reservations = reservationsData;
		} catch (error) {
			console.error('Error loading admin data:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Admin Dashboard - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>🛡️ Admin Dashboard</h1>
		<p>UniSpace system management</p>
	</div>

	{#if loading}
		<div class="loading">
			<div class="loader"></div>
		</div>
	{:else}
		<div class="stats-grid grid grid-3">
			<Card>
				<div class="stat-card">
					<div class="stat-icon">🏛️</div>
					<div class="stat-value">{buildings.length}</div>
					<div class="stat-label">Buildings</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-icon">📍</div>
					<div class="stat-value">{spaces.length}</div>
					<div class="stat-label">Spaces</div>
				</div>
			</Card>

			<Card>
				<div class="stat-card">
					<div class="stat-icon">📅</div>
					<div class="stat-value">{reservations.length}</div>
					<div class="stat-label">Reservations</div>
				</div>
			</Card>
		</div>

		<div class="admin-sections">
			<section class="admin-section">
				<h2>Quick Actions</h2>
				<div class="quick-actions">
					<button
						class="btn btn-primary"
						onclick={() => snackbar.add('Feature coming soon', 'info')}
					>
						➕ Create Building
					</button>
					<button
						class="btn btn-primary"
						onclick={() => snackbar.add('Feature coming soon', 'info')}
					>
						➕ Create Space
					</button>
					<a href="/reservations" class="btn btn-secondary"> 📋 View All Reservations </a>
				</div>
			</section>

			<section class="admin-section">
				<h2>Recent Buildings</h2>
				<div class="items-list">
					{#if buildings.length === 0}
						<p class="empty">No buildings available</p>
					{:else}
						{#each buildings.slice(0, 5) as building}
							<Card>
								<div class="item">
									<div>
										<strong>{building.name}</strong>
										<p class="item-meta">{building.address}</p>
									</div>
									<a href="/buildings/{building.id}" class="btn btn-secondary">Details</a>
								</div>
							</Card>
						{/each}
					{/if}
				</div>
			</section>

			<section class="admin-section">
				<h2>Recent Spaces</h2>
				<div class="items-list">
					{#if spaces.length === 0}
						<p class="empty">No spaces available</p>
					{:else}
						{#each spaces.slice(0, 5) as space}
							<Card>
								<div class="item">
									<div>
										<strong>{space.name}</strong>
										<p class="item-meta">
											{space.type} • Capacity: {space.capacity}
										</p>
									</div>
									<a href="/spaces/{space.id}" class="btn btn-secondary">Details</a>
								</div>
							</Card>
						{/each}
					{/if}
				</div>
			</section>
		</div>
	{/if}
</div>

<style>
    .page-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }

    .page-header h1 {
        margin-bottom: var(--spacing-sm);
    }

    .page-header p {
        color: var(--color-text-secondary);
    }

    .loading {
        display: flex;
        justify-content: center;
        padding: var(--spacing-2xl);
    }

    .stats-grid {
        margin-bottom: var(--spacing-2xl);
    }

    .stat-card {
        text-align: center;
        padding: var(--spacing-xl);
    }

    .stat-icon {
        font-size: 2.5rem;
        width: 5rem;
        height: 5rem;
        margin: 0 auto var(--spacing-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-tertiary);
        border-radius: 50%;
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
        line-height: 1;
    }

    .stat-label {
        color: var(--color-text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
    }

    .admin-sections {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2xl);
    }

    .admin-section h2 {
        margin-bottom: var(--spacing-lg);
    }

    .quick-actions {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
    }

    .items-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
    }

    .item-meta {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        margin: var(--spacing-xs) 0 0;
    }

    .empty {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
        .quick-actions {
            flex-direction: column;
        }

        .quick-actions .btn {
            width: 100%;
        }
    }
</style>
