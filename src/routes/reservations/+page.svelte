<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { api } from '$lib/services/api';
	import { snackbar } from '$lib/stores/snackbar';

	let { data }: { data: PageData } = $props();

	let reservations = $state(data.reservations || []);
	let selectedStatus = $state('ALL');

	const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'EXPIRED'];

	let filteredReservations = $derived(
		reservations.filter((r) => selectedStatus === 'ALL' || r.status === selectedStatus)
	);

	async function confirmReservation(id: string) {
		try {
			const updated = await api.confirmReservation(id);
			reservations = reservations.map((r) => (r.id === id ? updated : r));
		} catch (error) {
			console.error('Error confirming reservation:', error);
			snackbar.add('Error confirming reservation', 'error');
		}
	}

	async function cancelReservation(id: string) {
		try {
			const updated = await api.cancelReservation(id);
			reservations = reservations.map((r) => (r.id === id ? updated : r));
		} catch (error) {
			console.error('Error cancelling reservation:', error);
			snackbar.add('Error cancelling reservation', 'error');
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('it-IT');
	}
</script>

<svelte:head>
	<title>Reservations - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>📅 Your Reservations</h1>
		<p>Manage all your reservations</p>
	</div>

	<div class="status-filters">
		{#each statuses as status}
			<button
				class="filter-btn"
				class:active={selectedStatus === status}
				onclick={() => (selectedStatus = status)}
			>
				{status === 'ALL' ? 'All' : status}
			</button>
		{/each}
	</div>

	{#if reservations.length === 0}
		<div class="empty-state">
			<p>You don't have any reservations yet.</p>
			<a href="/spaces" class="btn btn-primary">Book a Space</a>
		</div>
	{:else}
		<div class="reservations-list">
			{#each filteredReservations as reservation (reservation.id)}
				<Card>
					<div class="reservation-card">
						<div class="reservation-header">
							{#if reservation.header}
								<h3>{reservation.header}</h3>
							{:else}
								<h3>Space Reservation</h3>
							{/if}
							<Badge status={reservation.status} />
						</div>

						<div class="reservation-details">
							<div class="detail-row">
								<span class="detail-label">Space ID:</span>
								<span>{reservation.space}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Start:</span>
								<span>🕒 {formatDate(reservation.start_at)}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">End:</span>
								<span>🕒 {formatDate(reservation.end_at)}</span>
							</div>
							{#if reservation.created_at}
								<div class="detail-row">
									<span class="detail-label">Created on:</span>
									<span>{formatDate(reservation.created_at)}</span>
								</div>
							{/if}
						</div>

						<div class="reservation-actions">
							{#if reservation.status === 'PENDING'}
								<button class="btn btn-primary" onclick={() => confirmReservation(reservation.id)}>
									Confirm
								</button>
								<button class="btn btn-danger" onclick={() => cancelReservation(reservation.id)}>
									Cancel
								</button>
							{:else if reservation.status === 'CONFIRMED'}
								<button class="btn btn-danger" onclick={() => cancelReservation(reservation.id)}>
									Cancel
								</button>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		</div>

		{#if filteredReservations.length === 0}
			<div class="empty-state">
				<p>No reservations with status "{selectedStatus}"</p>
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

	.status-filters {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: var(--spacing-xl);
	}

	.filter-btn {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		background-color: var(--color-bg-primary);
		color: var(--color-text-primary);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.filter-btn:hover {
		border-color: var(--color-primary);
	}

	.filter-btn.active {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.reservations-list {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.reservation-card {
		padding: var(--spacing-md);
	}

	.reservation-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.reservation-header h3 {
		margin: 0;
	}

	.reservation-details {
		margin-bottom: var(--spacing-lg);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		padding: var(--spacing-sm) 0;
	}

	.detail-label {
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.reservation-actions {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: flex-end;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl);
		color: var(--color-text-secondary);
	}

	.empty-state .btn {
		margin-top: var(--spacing-md);
	}
</style>
