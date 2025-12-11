<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { api } from '$lib/services/api';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Building, MapPin, ArrowLeft } from 'lucide-svelte';

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
	<div class="building-header fade-in">
		<Button variant="secondary" onclick={() => history.back()} class="mb-4">
			<ArrowLeft size={16} class="mr-2 inline-block" />
			Back
		</Button>
		<h1>{building.name}</h1>
		<p class="building-address">{building.address}</p>
	</div>

	<Card class="mb-8 card-glass">
		<div class="building-info">
			<h2>Building Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<Building size={24} class="mb-2 text-primary" />
					<strong>Name</strong>
					<span>{building.name}</span>
				</div>
				<div class="info-item">
					<MapPin size={24} class="mb-2 text-primary" />
					<strong>Address</strong>
					<span>{building.address}</span>
				</div>
				{#if building.department}
					<div class="info-item">
						<div class="text-primary text-xl mb-2">🏢</div>
						<strong>Department</strong>
						<span>{building.department}</span>
					</div>
				{/if}
			</div>
		</div>
	</Card>

	<div class="spaces-section fade-in">
		<h2>Spaces in {building.name}</h2>

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
        font-size: 1.5rem;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-md);
    }

    .info-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--spacing-lg);
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        transition: transform 0.2s;
    }

    .info-item:hover {
        transform: translateY(-2px);
        border-color: var(--color-primary);
    }

    .info-item strong {
        color: var(--color-text-secondary);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-xs);
    }

    .info-item span {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--color-text-primary);
    }

    .id-text {
        font-family: monospace;
        font-size: 1rem !important;
        background: var(--color-bg-tertiary);
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-sm);
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
        font-size: 2.5rem;
        margin-bottom: var(--spacing-sm);
    }

    .space-card h3 {
        margin-bottom: var(--spacing-md);
    }

    .space-details {
        margin-bottom: var(--spacing-lg);
        color: var(--color-text-secondary);
        font-size: 0.9rem;
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
