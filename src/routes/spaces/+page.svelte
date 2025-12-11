<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let { data }: { data: PageData } = $props();

	let spaces = $derived(data.spaces || []);
	let searchTerm = $state('');
	let selectedType = $state('ALL');

	const spaceTypes = ['ALL', 'ROOM', 'LAB', 'AUDITORIUM', 'MEETING_ROOM', 'LIBRARY'];

	const spaceTypeLabels: Record<string, string> = {
		ROOM: 'Room',
		LAB: 'Laboratory',
		AUDITORIUM: 'Auditorium',
		MEETING_ROOM: 'Meeting Room',
		LIBRARY: 'Library'
	};

	const spaceTypeIcons: Record<string, string> = {
		ROOM: '🚪',
		LAB: '🔬',
		AUDITORIUM: '🎭',
		MEETING_ROOM: '👥',
		LIBRARY: '📚'
	};

	let filteredSpaces = $derived(
		spaces.filter((s) => {
			const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesType = selectedType === 'ALL' || s.type === selectedType;
			return matchesSearch && matchesType;
		})
	);
</script>

<svelte:head>
	<title>Spaces - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>📍 Available Spaces</h1>
		<p>Search and book university spaces</p>
	</div>

	<div class="filters">
		<div class="search-input-wrapper">
			<Input placeholder="Search spaces..." bind:value={searchTerm} />
		</div>

		<div class="type-filters">
			{#each spaceTypes as type}
				<Button
					variant={selectedType === type ? 'primary' : 'secondary'}
					class="filter-btn"
					onclick={() => (selectedType = type)}
				>
					{type === 'ALL' ? 'All' : spaceTypeLabels[type]}
				</Button>
			{/each}
		</div>
	</div>

	{#if spaces.length === 0}
		<div class="empty-state">
			<p>No spaces available at the moment.</p>
		</div>
	{:else}
		<div class="grid grid-3">
			{#each filteredSpaces as space (space.id)}
				<Card>
					<div class="space-card">
						<div class="space-icon">{spaceTypeIcons[space.type]}</div>
						<h3>{space.name}</h3>
						<div class="space-meta">
							<Badge>{spaceTypeLabels[space.type]}</Badge>
							{#if space.department}
								<Badge variant="outline">{space.department}</Badge>
							{/if}
							<span class="capacity">👥 {space.capacity} seats</span>
						</div>
						{#if space.building}
							<p class="space-building">📍 {space.building.name}</p>
						{/if}
						{#if space.floor !== undefined}
							<p class="space-floor">Floor: {space.floor}</p>
						{/if}
						{#if space.equipments && space.equipments.length > 0}
							<div class="equipments">
								<strong>Equipment:</strong>
								<ul>
									{#each space.equipments as equipment}
										<li>{equipment.name}</li>
									{/each}
								</ul>
							</div>
						{/if}
						<div class="space-actions">
							<a href="/spaces/{space.id}" class="btn btn-primary"> Details </a>
						</div>
					</div>
				</Card>
			{/each}
		</div>

		{#if filteredSpaces.length === 0}
			<div class="empty-state">
				<p>No results found</p>
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

    .filters {
        margin-bottom: var(--spacing-xl);
    }

    .search-input-wrapper {
        max-width: 600px;
        margin: 0 auto var(--spacing-lg);
    }

    .type-filters {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        flex-wrap: wrap;
    }

    .space-card {
        text-align: center;
        padding: var(--spacing-md);
    }

    .space-icon {
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

    .space-card h3 {
        margin-bottom: var(--spacing-md);
    }

    .space-meta {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        align-items: center;
        margin-bottom: var(--spacing-md);
    }

    .capacity {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    .space-building,
    .space-floor {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-xs);
    }

    .equipments {
        margin: var(--spacing-md) 0;
        text-align: left;
        font-size: 0.875rem;
    }

    .equipments ul {
        margin-top: var(--spacing-xs);
        padding-left: var(--spacing-lg);
    }

    .equipments li {
        color: var(--color-text-secondary);
    }

    .space-actions {
        margin-top: var(--spacing-md);
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--color-text-secondary);
    }
</style>
