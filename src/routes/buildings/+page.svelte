<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data }: { data: PageData } = $props();

	let buildings = $derived(data.buildings || []);
	let searchTerm = $state('');

	let filteredBuildings = $derived(
		buildings.filter(
			(b) =>
				b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				b.address.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Buildings - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>🏛️ University Buildings</h1>
		<p>Explore all campus buildings</p>
	</div>

	<div class="search-bar">
		<Input
			type="text"
			placeholder="Search buildings by name or address..."
			bind:value={searchTerm}
		/>
	</div>

	{#if buildings.length === 0}
		<div class="empty-state">
			<p>No buildings available at the moment.</p>
		</div>
	{:else}
		<div class="grid grid-3">
			{#each filteredBuildings as building (building.id)}
				<Card>
					<div class="building-card">
						<div class="building-icon">🏛️</div>
						<h3>{building.name}</h3>
						{#if building.department}
							<div class="department-badge">{building.department}</div>
						{/if}
						<p class="building-address">📍 {building.address}</p>
						<div class="building-actions">
							<a href="/buildings/{building.id}" class="btn btn-primary">Details</a>
						</div>
					</div>
				</Card>
			{/each}
		</div>

		{#if filteredBuildings.length === 0}
			<div class="empty-state">
				<p>No results for "{searchTerm}"</p>
			</div>
		{/if}
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

    .search-bar {
        max-width: 600px;
        margin: 0 auto var(--spacing-xl);
    }

    .building-card {
        text-align: center;
        padding: var(--spacing-md);
    }

    .building-icon {
        font-size: 2.5rem;
        width: 4.5rem;
        height: 4.5rem;
        margin: 0 auto var(--spacing-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-tertiary);
        border-radius: 50%;
        border: 1px solid var(--color-border);
    }

    .building-card h3 {
        margin-bottom: var(--spacing-sm);
    }

    .building-address {
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-lg);
        font-size: 0.9rem;
    }

    .building-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
    }

    .department-badge {
        display: inline-block;
        background: var(--color-bg-secondary);
        color: var(--color-primary);
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
        border: 1px solid var(--color-primary);
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--color-text-secondary);
    }
</style>
