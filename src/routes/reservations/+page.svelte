<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import { api } from '$lib/services/api';
	import { snackbar } from '$lib/stores/snackbar';
	import { canManageReservations, currentUser } from '$lib/stores/auth';

	let { data }: { data: PageData } = $props();

	let reservations = $state(data.reservations || []);
	let selectedStatus = $state('ALL');
	let canManage = $state(false);
	let currentUsername = $state<string | null>(null);

	const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'];

	$effect(() => {
		const unsubManage = canManageReservations.subscribe((value) => (canManage = value));
		const unsubUser = currentUser.subscribe((user) => (currentUsername = user?.username || null));
		return () => {
			unsubManage();
			unsubUser();
		};
	});

	let filteredReservations = $derived(
		reservations.filter((r) => selectedStatus === 'ALL' || r.status === selectedStatus)
	);

	function isOwnReservation(reservation: any): boolean {
		return reservation.created_by === currentUsername;
	}

	async function confirmReservation(id: string) {
		try {
			const updated = await api.confirmReservation(id);
			reservations = reservations.map((r) => (r.id === id ? updated : r));
			snackbar.add('Reservation confirmed', 'success');
		} catch (error) {
			console.error('Error confirming reservation:', error);
			snackbar.add('Error confirming reservation', 'error');
		}
	}

	async function cancelReservation(id: string) {
		try {
			const updated = await api.cancelReservation(id);
			reservations = reservations.map((r) => (r.id === id ? updated : r));
			snackbar.add('Reservation cancelled', 'success');
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
			<Button
				variant={selectedStatus === status ? 'primary' : 'secondary'}
				class="filter-btn"
				onclick={() => (selectedStatus = status)}
			>
				{status === 'ALL' ? 'All' : status}
			</Button>
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
								{#if isOwnReservation(reservation)}
									<!-- Own pending reservation: can only cancel -->
									<Button variant="danger" onclick={() => cancelReservation(reservation.id)}>
										Cancel
									</Button>
								{:else if canManage}
									<!-- Professor/Admin viewing others' pending reservation: can confirm or reject -->
									<Button variant="primary" onclick={() => confirmReservation(reservation.id)}>
										Confirm
									</Button>
									<Button variant="danger" onclick={() => cancelReservation(reservation.id)}>
										Cancel
									</Button>
								{/if}
							{:else if reservation.status === 'CONFIRMED'}
								{#if isOwnReservation(reservation)}
									<!-- Own confirmed reservation: can cancel -->
									<Button variant="danger" onclick={() => cancelReservation(reservation.id)}>
										Cancel
									</Button>
								{/if}
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
