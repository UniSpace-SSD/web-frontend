<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { onMount } from 'svelte';
	// import { Type, Layers, Users, Building as BuildingIcon, ArrowLeft, MapPin } from 'lucide-svelte';
	import { isAdmin, currentUser } from '$lib/stores/auth';
	import type { Reservation } from '$lib/services/api';

	let { data }: { data: PageData } = $props();

	let space = $derived(data.space);

	const isAdminUser = $derived($isAdmin);
	const isProfessorUser = $derived($currentUser?.role === 'professor');
	const currentUserName = $derived($currentUser?.username);

	const spaceTypeLabels: Record<string, string> = {
		ROOM: '🚪 Room',
		LAB: '🔬 Laboratory',
		AUDITORIUM: '🎭 Auditorium',
		MEETING_ROOM: '👥 Meeting Room',
		LIBRARY: '📚 Library'
	};

	let isAuthenticated = $state(false);

	let reservationForm = $state({
		header: '',
		date: '',
		startTime: '',
		endTime: ''
	});

	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	let loading = $state(false);
	let loadingReservations = $state(false);
	let spaceReservations = $state<Reservation[]>([]);

	onMount(async () => {
		isAuthenticated = !!api.getToken();
		loadingReservations = true;
		if (data.space) {
			await loadReservations();
		}
		loadingReservations = false;
	});

	async function loadReservations() {
		try {
			if (!space?.id) return;
			const allReservations = await api.getReservationsBySpace(space.id);
			spaceReservations = allReservations.filter(
				(r) => r.status !== 'CANCELLED' && r.status !== 'REJECTED'
			);
		} catch (error) {
			console.error('Error loading reservations:', error);
		}
	}

	function checkOverlap(start: Date, end: Date): boolean {
		return spaceReservations.some((reservation) => {
			if (reservation.status === 'CANCELLED' || reservation.status === 'REJECTED') return false;
			const existingStart = new Date(reservation.start_at);
			const existingEnd = new Date(reservation.end_at);
			return start < existingEnd && end > existingStart;
		});
	}

	async function handleReservation(e: Event) {
		e.preventDefault();
		errorMessage = '';
		successMessage = '';

		if (!reservationForm.date || !reservationForm.startTime || !reservationForm.endTime) {
			errorMessage = 'Please fill in all date and time fields.';
			return;
		}

		const start = new Date(`${reservationForm.date}T${reservationForm.startTime}`);
		const end = new Date(`${reservationForm.date}T${reservationForm.endTime}`);
		const now = new Date();

		if (start < now) {
			errorMessage = 'Start time must be in the future.';
			return;
		}

		if (end <= start) {
			errorMessage = 'End time must be after start time.';
			return;
		}

		if (checkOverlap(start, end)) {
			errorMessage = 'This space is already reserved for the selected time.';
			return;
		}

		isSubmitting = true;

		try {
			const newReservation = await api.createReservation({
				space: space.id,
				header: reservationForm.header.trim() || undefined,
				start_at: start.toISOString(),
				end_at: end.toISOString()
			});

			successMessage = 'Reservation request submitted successfully!';

			reservationForm = {
				header: '',
				date: '',
				startTime: '',
				endTime: ''
			};

			await loadReservations();
		} catch (error: any) {
			errorMessage = error.message || 'Failed to create reservation.';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleReservationAction(
		reservationId: string,
		action: 'confirm' | 'reject' | 'cancel'
	) {
		if (!confirm(`Are you sure you want to ${action} this reservation?`)) return;

		try {
			if (action === 'confirm') {
				await api.confirmReservation(reservationId);
			} else {
				await api.cancelReservation(reservationId);
			}
			await loadReservations();
		} catch (e: any) {
			alert('Error: ' + e.message);
		}
	}

	function canCancel(reservation: any): boolean {
		if (isAdminUser || isProfessorUser) return false;
		// Students can only cancel their own
		return reservation.created_by === currentUserName;
	}

	function canManage(reservation: any): boolean {
		return isAdminUser || isProfessorUser;
	}
</script>

<svelte:head>
	<title>{space?.name} - UniSpace</title>
</svelte:head>

<div class="container fade-in">
	{#if loading}
		<div class="loading-state">
			<div class="loader"></div>
			<p>Loading space details...</p>
		</div>
	{:else if space}
		<div class="space-details">
			<Button variant="secondary" onclick={() => history.back()} class="mb-4">
				<span class="mr-2">←</span> Back
			</Button>

			<div class="header">
				<h1>{space.name}</h1>
				<div class="badges">
					<Badge variant="primary">{spaceTypeLabels[space.type]}</Badge>
					{#if space.department}
						<Badge variant="outline">{space.department}</Badge>
					{/if}
				</div>
			</div>

			<div class="content-grid">
				<div class="main-info">
					<Card>
						<div class="image-placeholder">
							<div class="placeholder-icon">🏢</div>
						</div>

						<div class="info-grid">
							<div class="info-item">
								<!-- Replaced Icon with Emoji/Text -->
								<div class="text-primary text-xl mb-2">🏷️</div>
								<strong>Type</strong>
								<span>{spaceTypeLabels[space.type] || space.type}</span>
							</div>
							<div class="info-item">
								<div class="text-primary text-xl mb-2">👥</div>
								<strong>Capacity</strong>
								<span>{space.capacity} People</span>
							</div>
							<div class="info-item">
								<div class="text-primary text-xl mb-2">📍</div>
								<strong>Floor</strong>
								<span>{space.floor !== undefined ? `Level ${space.floor}` : 'N/A'}</span>
							</div>
							<div class="info-item">
								<div class="text-primary text-xl mb-2">🏢</div>
								<strong>Building</strong>
								<a href="/buildings/{space.building?.id || space.building}"
								>{space.building?.name || 'View Building'}</a
								>
							</div>
							{#if space.department}
								<div class="info-item">
									<div class="text-primary text-xl mb-2">🏢</div>
									<strong>Department</strong>
									<span>{space.department}</span>
								</div>
							{/if}
						</div>

						{#if space.equipments && space.equipments.length > 0}
							<div class="equipments">
								<h3>Equipment</h3>
								<div class="equipment-list">
									{#each space.equipments as equipment}
										<div class="equipment-tag">
											🔧 {equipment.name}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</Card>

					<!-- Reservations List -->
					<div class="reservations-section mt-4">
						<h2>Reservations</h2>
						{#if loadingReservations}
							<div class="loader"></div>
						{:else if spaceReservations.length === 0}
							<p class="text-secondary">No active reservations for this space.</p>
						{:else}
							<div class="reservations-list">
								{#each spaceReservations as res}
									<Card class="mb-2">
										<div class="reservation-item">
											<div class="res-info">
												<strong>{res.header || 'Reservation'}</strong>
												<p class="text-sm">
													{new Date(res.start_at).toLocaleString()} - {new Date(
													res.end_at
												).toLocaleTimeString()}
												</p>
												<p class="text-xs text-secondary">Status: {res.status}</p>
												<p class="text-xs text-secondary">User: {res.created_by}</p>
											</div>
											<div class="res-actions">
												{#if canCancel(res) && res.status !== 'CANCELLED' && res.status !== 'REJECTED'}
													<Button
														variant="danger"
														size="small"
														onclick={() => handleReservationAction(res.id, 'cancel')}
													>
														Cancel
													</Button>
												{/if}
												{#if canManage(res)}
													{#if res.status === 'PENDING'}
														<Button
															variant="primary"
															size="small"
															onclick={() => handleReservationAction(res.id, 'confirm')}
														>
															Confirm
														</Button>
														<Button
															variant="danger"
															size="small"
															onclick={() => handleReservationAction(res.id, 'reject')}
														>
															Reject
														</Button>
													{/if}
												{/if}
											</div>
										</div>
									</Card>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<div class="sidebar">
					{#if isAuthenticated}
						<Card>
							<h2>Book this Space</h2>
							{#if successMessage}
								<div class="alert alert-success">
									✅ {successMessage}
								</div>
							{/if}

							{#if errorMessage}
								<div class="alert alert-error">
									❌ {errorMessage}
								</div>
							{/if}
							<form class="reservation-form" onsubmit={handleReservation}>
								<div class="form-group-wrapper">
									<Input
										id="title"
										label="Title / Reason"
										bind:value={reservationForm.header}
										placeholder="e.g. Logic Lesson"
									/>
								</div>

								<div class="form-group-wrapper">
									<Input
										type="date"
										id="date"
										label="Date"
										bind:value={reservationForm.date}
										required
									/>
								</div>

								<div class="form-row">
									<div class="form-group-wrapper">
										<Input
											type="time"
											id="startTime"
											label="Start Time"
											bind:value={reservationForm.startTime}
											required
										/>
									</div>
									<div class="form-group-wrapper">
										<Input
											type="time"
											id="endTime"
											label="End Time"
											bind:value={reservationForm.endTime}
											required
										/>
									</div>
								</div>

								<div class="scan-button-wrapper">
									<Button
										type="button"
										variant="secondary"
										class="scan-btn"
										onclick={() => alert('QR Scan feature coming soon!')}
									>
										📷 Scan QR Code
									</Button>
								</div>

								<div class="actions">
									<Button type="submit" disabled={isSubmitting} class="w-full">
										{#if isSubmitting}
											Booking...
										{:else}
											Confirm Booking
										{/if}
									</Button>
								</div>
							</form>
						</Card>
					{:else}
						<Card>
							<div class="auth-required">
								<p>🔒 You must be authenticated to book this space.</p>
								<a href="/login" class="btn-primary">Login</a>
							</div>
						</Card>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="error-state">
			<h2>Space not found</h2>
			<a href="/spaces" class="btn btn-primary">Back to Spaces</a>
		</div>
	{/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }

    .loading-state,
    .error-state {
        text-align: center;
        padding: var(--spacing-2xl);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
    }

    .header {
        margin-bottom: var(--spacing-xl);
    }

    .badges {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }

    .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--spacing-xl);
        align-items: start;
    }

    .image-placeholder {
        width: 100%;
        height: 200px;
        background: var(--color-bg-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-md);
    }

    .placeholder-icon {
        font-size: 3rem;
        opacity: 0.5;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .info-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--spacing-md);
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

    .info-item span,
    .info-item a {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text-primary);
    }

    .info-item a:hover {
        color: var(--color-primary);
        text-decoration: underline;
    }

    /* Equipment Section */
    .equipments {
        margin-top: var(--spacing-lg);
        border-top: 1px solid var(--color-border);
        padding-top: var(--spacing-lg);
    }

    .equipments h3 {
        margin-bottom: var(--spacing-md);
        font-size: 1.25rem;
    }

    .equipment-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
    }

    .equipment-tag {
        padding: 0.5rem 1rem;
        background: var(--color-bg-secondary);
        border-radius: 999px;
        border: 1px solid var(--color-border);
        font-size: 0.9rem;
    }

    .reservations-section {
        margin-top: var(--spacing-2xl);
        border-top: 1px solid var(--color-border);
        padding-top: var(--spacing-lg);
    }

    /* Form styles */
    .form-group-wrapper {
        margin-bottom: var(--spacing-lg);
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }

    .scan-button-wrapper {
        margin: var(--spacing-lg) 0;
    }

    .scan-btn {
        width: 100%;
    }

    .auth-required {
        text-align: center;
        padding: var(--spacing-lg);
    }

    .auth-required p {
        margin-bottom: var(--spacing-md);
        color: var(--color-text-secondary);
    }

    .btn-primary {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: var(--color-primary);
        color: white;
        border-radius: var(--radius-md);
        text-decoration: none;
    }

    .alert {
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-md);
    }

    .alert-success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid var(--color-success);
        color: var(--color-success);
    }

    .alert-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--color-error);
        color: var(--color-error);
    }

    .reservation-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-md);
    }

    .text-secondary {
        color: var(--color-text-secondary);
    }

    .text-sm {
        font-size: 0.875rem;
    }

    .text-xs {
        font-size: 0.75rem;
    }
</style>
