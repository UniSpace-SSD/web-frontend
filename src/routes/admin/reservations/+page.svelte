<script lang="ts">
	import { api } from '$lib/services/api';
	import { onMount } from 'svelte';
	import { isAdmin } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import { snackbar } from '$lib/stores/snackbar';
	import type { Reservation } from '$lib/services/api';

	let reservations = $state<Reservation[]>([]);
	let loading = $state(true);

	onMount(() => {
		// Verifica se l'utente è admin
		const unsubscribe = isAdmin.subscribe((value) => {
			if (!value) {
				// Se non è admin, reindirizza alla home
				goto('/');
			}
		});
		
		// Carica le reservations
		loadReservations();
		
		return unsubscribe;
	});

	async function loadReservations() {
		loading = true;
		try {
			reservations = await api.getReservations();
		} catch (error) {
			console.error('Error loading reservations:', error);
			snackbar.add('Failed to load reservations', 'error');
		} finally {
			loading = false;
		}
	}

	async function handleAction(reservationId: string, action: 'confirm' | 'cancel') {
		try {
			if (action === 'confirm') {
				await api.confirmReservation(reservationId);
				snackbar.add('Reservation confirmed', 'success');
			} else {
				await api.cancelReservation(reservationId);
				snackbar.add('Reservation cancelled', 'success');
			}
			loadReservations();
		} catch (error) {
			console.error(`Error ${action}ing reservation:`, error);
			snackbar.add(`Failed to ${action} reservation`, 'error');
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'CONFIRMED':
				return 'success';
			case 'PENDING':
				return 'warning';
			case 'CANCELLED':
				return 'danger';
			default:
				return 'secondary';
		}
	}
</script>

<svelte:head>
	<title>Admin Reservations - UniSpace</title>
</svelte:head>

<div class="container fade-in">
	<div class="page-header">
		<div class="header-content">
			<h1>All Reservations</h1>
			<p>Manage all system reservations</p>
		</div>
		<a href="/admin" class="btn btn-secondary">← Back to Dashboard</a>
	</div>

	{#if loading}
		<div class="loading">
			<div class="loader"></div>
		</div>
	{:else}
		<Card>
			<div class="table-container">
				<table class="reservations-table">
					<thead>
					<tr>
						<th>Reason / Header</th>
						<th>Start</th>
						<th>End</th>
						<th>Status</th>
						<th>Created By</th>
						<th>Actions</th>
					</tr>
					</thead>
					<tbody>
					{#if reservations.length === 0}
						<tr>
							<td colspan="6" class="empty-cell">No reservations found</td>
						</tr>
					{:else}
						{#each reservations as res}
							<tr>
								<td><strong>{res.header || 'Reservation'}</strong></td>
								<td>{new Date(res.start_at).toLocaleString()}</td>
								<td>{new Date(res.end_at).toLocaleString()}</td>
								<td>
									<Badge variant={getStatusColor(res.status)}>{res.status}</Badge>
								</td>
								<td>{res.created_by}</td>
								<td class="actions-cell">
									{#if res.status === 'PENDING'}
										<div class="btn-group">
											<Button
												variant="primary"
												size="small"
												onclick={() => handleAction(res.id, 'confirm')}
											>
												Confirm
											</Button>
											<Button
												variant="danger"
												size="small"
												onclick={() => handleAction(res.id, 'cancel')}
											>
												Cancel
											</Button>
										</div>
									{:else}
										<span class="text-secondary">-</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
					</tbody>
				</table>
			</div>
		</Card>
	{/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
    }

    .header-content h1 {
        margin-bottom: var(--spacing-2xs);
    }

    .header-content p {
        color: var(--color-text-secondary);
    }

    .loading {
        display: flex;
        justify-content: center;
        padding: var(--spacing-2xl);
    }

    .table-container {
        overflow-x: auto;
    }

    .reservations-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
    }

    .reservations-table th,
    .reservations-table td {
        padding: var(--spacing-md);
        text-align: left;
        border-bottom: 1px solid var(--color-border);
    }

    .reservations-table th {
        font-weight: 600;
        color: var(--color-text-secondary);
        background: var(--color-bg-secondary);
    }

    .reservations-table tr:last-child td {
        border-bottom: none;
    }

    .empty-cell {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--color-text-secondary);
    }

    .actions-cell {
        min-width: 160px;
    }

    .btn-group {
        display: flex;
        gap: var(--spacing-xs);
    }

    .text-secondary {
        color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: flex-start;
        }
    }
</style>