<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let building = $derived(data.building);
	let spaces = $derived(data.spaces || []);

	const spaceTypeLabels: Record<string, string> = {
		ROOM: '🚪 Aula',
		LAB: '🔬 Laboratorio',
		AUDITORIUM: '🎭 Auditorium',
		MEETING_ROOM: '👥 Sala Riunioni',
		LIBRARY: '📚 Biblioteca'
	};

	function handleBack() {
		goto('/buildings');
	}
</script>

<svelte:head>
	<title>{building.name} - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="building-header">
		<button class="back-button" onclick={handleBack}> ← Back to buildings </button>
		<h1>🏛️ {building.name}</h1>
		<p class="building-address">📍 {building.address}</p>
	</div>

	<Card>
		<div class="building-info">
			<h2>Building Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<strong>Name:</strong>
					<span>{building.name}</span>
				</div>
				<div class="info-item">
					<strong>Address:</strong>
					<span>{building.address}</span>
				</div>
				<div class="info-item">
					<strong>ID:</strong>
					<span class="id-text">{building.id}</span>
				</div>
			</div>
		</div>
	</Card>

	<div class="spaces-section">
		<h2>📍 Spaces in this building</h2>

		{#if spaces.length === 0}
			<div class="empty-state">
				<p>No spaces found in this building.</p>
			</div>
		{:else}
			<div class="grid grid-3">
				{#each spaces as space (space.id)}
					<Card>
						<div class="space-card">
							<div class="space-type">{spaceTypeLabels[space.type] || space.type}</div>
							<h3>{space.name}</h3>
							<div class="space-details">
								{#if space.floor !== null && space.floor !== undefined}
									<p>🏛 Floor: {space.floor}</p>
								{/if}
								<p>👥 Capacity: {space.capacity} people</p>
								{#if space.equipments && space.equipments.length > 0}
									<p>🔧 Equipment: {space.equipments.length}</p>
								{/if}
							</div>
							<div class="space-actions">
								<a href="/spaces/{space.id}" class="btn btn-primary"> Details </a>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.building-header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}

	.back-button {
		background: var(--color-background-secondary);
		color: var(--color-text);
		border: none;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		cursor: pointer;
		margin-bottom: var(--spacing-md);
		transition: background-color 0.2s;
	}

	.back-button:hover {
		background: var(--color-background-tertiary);
	}

	.building-header h1 {
		margin-bottom: var(--spacing-sm);
	}

	.building-address {
		color: var(--color-text-secondary);
		font-size: 1.1rem;
	}

	.building-info {
		padding: var(--spacing-md);
	}

	.building-info h2 {
		margin-bottom: var(--spacing-md);
	}

	.info-grid {
		display: grid;
		gap: var(--spacing-md);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm);
		background: var(--color-background-secondary);
		border-radius: var(--radius-sm);
	}

	.info-item strong {
		color: var(--color-text-secondary);
	}

	.id-text {
		font-family: monospace;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.spaces-section {
		margin-top: var(--spacing-2xl);
	}

	.spaces-section h2 {
		margin-bottom: var(--spacing-lg);
	}

	.space-card {
		text-align: center;
		padding: var(--spacing-md);
	}

	.space-type {
		font-size: 2rem;
		margin-bottom: var(--spacing-sm);
	}

	.space-card h3 {
		margin-bottom: var(--spacing-md);
	}

	.space-details {
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-secondary);
	}

	.space-details p {
		margin-bottom: var(--spacing-xs);
	}

	.space-actions {
		display: flex;
		justify-content: center;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl);
		color: var(--color-text-secondary);
	}
</style>
