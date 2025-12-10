<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let space = $derived(data.space);

	const spaceTypeLabels: Record<string, string> = {
		ROOM: '🚪 Room',
		LAB: '🔬 Laboratory',
		AUDITORIUM: '🎭 Auditorium',
		MEETING_ROOM: '👥 Meeting Room',
		LIBRARY: '📚 Library'
	};

	let isAuthenticated = $state(false);
	let header = $state('');
	let startAt = $state('');
	let endAt = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let existingReservations = $state<any[]>([]);

	onMount(async () => {
		isAuthenticated = !!api.getToken();

		if (isAuthenticated) {
			await loadReservations();
		}
	});

	async function loadReservations() {
		try {
			const allReservations = await api.getReservations();
			existingReservations = allReservations.filter(
				(r) => r.space === space.id && r.status !== 'CANCELLED' && r.status !== 'REJECTED'
			);
		} catch (error) {
			console.error('Error loading reservations:', error);
		}
	}

	function handleBack() {
		if (space.building_id) {
			goto(`/buildings/${space.building_id}`);
		} else {
			goto('/spaces');
		}
	}

	function checkOverlap(start: Date, end: Date): boolean {
		return existingReservations.some((reservation) => {
			const existingStart = new Date(reservation.start_at);
			const existingEnd = new Date(reservation.end_at);

			return start < existingEnd && end > existingStart;
		});
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';
		successMessage = '';

		if (!startAt || !endAt) {
			errorMessage = 'Please enter start and end date and time.';
			return;
		}

		const start = new Date(startAt);
		const end = new Date(endAt);
		const now = new Date();

		if (start < now) {
			errorMessage = 'Start date must be in the future.';
			return;
		}

		if (end <= start) {
			errorMessage = 'End date must be after start date.';
			return;
		}

		if (checkOverlap(start, end)) {
			errorMessage = 'This space is already booked for the selected period.';
			return;
		}

		isSubmitting = true;

		try {
			const newReservation = await api.createReservation({
				space: space.id,
				header: header.trim() || undefined,
				start_at: start.toISOString(),
				end_at: end.toISOString()
			});

			successMessage = `Reservation created successfully! Status: ${newReservation.status}`;

			// Reset form
			header = '';
			startAt = '';
			endAt = '';

			await loadReservations();

			setTimeout(() => {
				goto('/profile');
			}, 2000);
		} catch (error: any) {
			errorMessage = error.message || 'Errore durante la creazione della prenotazione.';
		} finally {
			isSubmitting = false;
		}
	}

	function getMinDateTime(): string {
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	}
</script>

<svelte:head>
	<title>{space.name} - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="space-header">
		<button class="back-button" onclick={handleBack}>
			← Back to {space.building_id ? 'building' : 'spaces'}
		</button>
		<div class="space-type-large">{spaceTypeLabels[space.type] || space.type}</div>
		<h1>{space.name}</h1>
	</div>

	<Card>
		<div class="space-info">
			<h2>Space Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<strong>Name:</strong>
					<span>{space.name}</span>
				</div>
				<div class="info-item">
					<strong>Type:</strong>
					<span>{spaceTypeLabels[space.type] || space.type}</span>
				</div>
				{#if space.floor !== null && space.floor !== undefined}
					<div class="info-item">
						<strong>Floor:</strong>
						<span>{space.floor}</span>
					</div>
				{/if}
				<div class="info-item">
					<strong>Capacity:</strong>
					<span>{space.capacity} people</span>
				</div>
				{#if space.building}
					<div class="info-item">
						<strong>Building:</strong>
						<a href="/buildings/{space.building.id}">{space.building.name}</a>
					</div>
				{/if}
				<div class="info-item">
					<strong>ID:</strong>
					<span class="id-text">{space.id}</span>
				</div>
			</div>
		</div>
	</Card>

	<!-- Reservation Form Section -->
	{#if isAuthenticated}
		<div class="reservation-section">
			<Card>
				<h2>📅 Book this Space</h2>

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

				<form onsubmit={handleSubmit}>
					<div class="form-group">
						<label for="header">
							Reason (optional)
							<span class="label-hint">e.g. Calculus 1 Lecture</span>
						</label>
						<input
							type="text"
							id="header"
							bind:value={header}
							placeholder="Enter reservation reason"
							maxlength="255"
						/>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="start-at">
								Start Date and Time <span class="required">*</span>
							</label>
							<input
								type="datetime-local"
								id="start-at"
								bind:value={startAt}
								min={getMinDateTime()}
								required
							/>
						</div>

						<div class="form-group">
							<label for="end-at">
								End Date and Time <span class="required">*</span>
							</label>
							<input
								type="datetime-local"
								id="end-at"
								bind:value={endAt}
								min={startAt || getMinDateTime()}
								required
							/>
						</div>
					</div>

					<button type="submit" class="btn-primary" disabled={isSubmitting}>
						{isSubmitting ? '⏳ Creating...' : '✨ Create Reservation'}
					</button>
				</form>
			</Card>
		</div>

		<!-- Existing Reservations List -->
		{#if existingReservations.length > 0}
			<div class="existing-reservations">
				<h2>🗓️ Existing Reservations</h2>
				<Card>
					<div class="reservations-list">
						{#each existingReservations as reservation (reservation.id)}
							<div class="reservation-item">
								<div class="reservation-info">
									{#if reservation.header}
										<strong>{reservation.header}</strong>
									{:else}
										<strong>Reservation</strong>
									{/if}
									<div class="reservation-dates">
										<span>📅 {new Date(reservation.start_at).toLocaleString('it-IT')}</span>
										<span>→</span>
										<span>{new Date(reservation.end_at).toLocaleString('it-IT')}</span>
									</div>
								</div>
								<div class="reservation-status status-{reservation.status.toLowerCase()}">
									{reservation.status}
								</div>
							</div>
						{/each}
					</div>
				</Card>
			</div>
		{/if}
	{:else}
		<Card>
			<div class="auth-required">
				<p>🔒 You must be authenticated to book this space.</p>
				<a href="/login" class="btn-primary">Login</a>
			</div>
		</Card>
	{/if}

	{#if space.equipments && space.equipments.length > 0}
		<div class="equipments-section">
			<h2>🔧 Available Equipment</h2>
			<div class="grid grid-3">
				{#each space.equipments as equipment (equipment.id)}
					<Card>
						<div class="equipment-card">
							<h3>{equipment.name}</h3>
							{#if equipment.description}
								<p>{equipment.description}</p>
							{/if}
						</div>
					</Card>
				{/each}
			</div>
		</div>
	{:else}
		<Card>
			<div class="empty-state">
				<p>No equipment available in this space.</p>
			</div>
		</Card>
	{/if}
</div>

<style>
	.space-header {
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

	.space-type-large {
		font-size: 4rem;
		margin-bottom: var(--spacing-sm);
	}

	.space-header h1 {
		margin-bottom: var(--spacing-sm);
	}

	.space-info {
		padding: var(--spacing-md);
	}

	.space-info h2 {
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

	.info-item a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.info-item a:hover {
		text-decoration: underline;
	}

	.id-text {
		font-family: monospace;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.equipments-section {
		margin-top: var(--spacing-2xl);
	}

	.equipments-section h2 {
		margin-bottom: var(--spacing-lg);
	}

	.equipment-card {
		padding: var(--spacing-md);
		text-align: center;
	}

	.equipment-card h3 {
		margin-bottom: var(--spacing-sm);
	}

	.equipment-card p {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl);
		color: var(--color-text-secondary);
	}

	/* Reservation Form Styles */
	.reservation-section {
		margin-top: var(--spacing-2xl);
	}

	.reservation-section h2 {
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md);
	}

	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	.form-group label {
		display: block;
		margin-bottom: var(--spacing-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	.label-hint {
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--color-text-secondary);
		margin-left: var(--spacing-xs);
	}

	.required {
		color: #e63946;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 2px solid var(--color-background-secondary);
		border-radius: var(--radius-md);
		background: var(--color-background);
		color: var(--color-text);
		font-size: 1rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}

	.btn-primary {
		display: inline-block;
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		text-align: center;
		width: 100%;
		margin-top: var(--spacing-sm);
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.alert {
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
		font-weight: 500;
	}

	.alert-success {
		background: #d1fae5;
		color: #065f46;
		border: 2px solid #10b981;
	}

	.alert-error {
		background: #fee2e2;
		color: #991b1b;
		border: 2px solid #ef4444;
	}

	/* Existing Reservations Styles */
	.existing-reservations {
		margin-top: var(--spacing-2xl);
	}

	.existing-reservations h2 {
		margin-bottom: var(--spacing-lg);
	}

	.reservations-list {
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.reservation-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md);
		background: var(--color-background-secondary);
		border-radius: var(--radius-md);
		gap: var(--spacing-md);
	}

	.reservation-info {
		flex: 1;
	}

	.reservation-info strong {
		display: block;
		margin-bottom: var(--spacing-xs);
		color: var(--color-text);
	}

	.reservation-dates {
		display: flex;
		gap: var(--spacing-xs);
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		flex-wrap: wrap;
	}

	.reservation-status {
		padding: var(--spacing-xs) var(--spacing-md);
		border-radius: var(--radius-sm);
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.status-pending {
		background: #fef3c7;
		color: #92400e;
	}

	.status-confirmed {
		background: #d1fae5;
		color: #065f46;
	}

	.status-cancelled,
	.status-rejected {
		background: #fee2e2;
		color: #991b1b;
	}

	.status-expired {
		background: #e5e7eb;
		color: #4b5563;
	}

	.auth-required {
		text-align: center;
		padding: var(--spacing-2xl);
	}

	.auth-required p {
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-secondary);
		font-size: 1.1rem;
	}

	.auth-required .btn-primary {
		display: inline-block;
		width: auto;
		padding: var(--spacing-md) var(--spacing-2xl);
	}
</style>
