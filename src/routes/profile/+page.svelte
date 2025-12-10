<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth';
	import { api } from '$lib/services/api';
	import type { User } from '$lib/services/api';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import { snackbar } from '$lib/stores/snackbar';

	let user = $state<User | null>(null);
	let isEditing = $state(false);
	let loading = $state(true);

	let editForm = $state({
		first_name: '',
		last_name: '',
		username: ''
	});

	onMount(async () => {
		currentUser.subscribe((value) => {
			user = value;
			if (user) {
				editForm = {
					first_name: user.first_name || '',
					last_name: user.last_name || '',
					username: user.username
				};
			}
			loading = false;
		});
	});

	async function handleUpdate() {
		if (!user) return;

		loading = true;
		try {
			const updated = await api.updateUser(editForm);

			if (typeof window !== 'undefined') {
				const currentUserData = localStorage.getItem('user');
				if (currentUserData) {
					const userData = JSON.parse(currentUserData);
					localStorage.setItem('user', JSON.stringify({ ...userData, ...updated }));
				}
			}

			user = updated;
			isEditing = false;
			snackbar.add('Profile updated successfully!', 'success');
		} catch (error) {
			console.error('Error updating profile:', error);
			snackbar.add('Error updating profile', 'error');
		} finally {
			loading = false;
		}
	}

	function getUserRole(): string {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('user_role') || 'student';
		}
		return 'student';
	}
</script>

<svelte:head>
	<title>Profile - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>👤 Your Profile</h1>
		<p>Manage your account information</p>
	</div>

	{#if loading}
		<div class="loading">
			<div class="loader"></div>
		</div>
	{:else if user}
		<div class="profile-content">
			<Card>
				<div class="profile-card">
					<div class="profile-avatar">
						<div class="avatar-circle">
							{user.first_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
						</div>
					</div>

					<div class="profile-info">
						{#if isEditing}
							<div class="edit-form">
								<div class="form-group">
									<label class="form-label">Username</label>
									<input
										type="text"
										class="form-input"
										bind:value={editForm.username}
										placeholder="Username"
									/>
								</div>

								<div class="form-row">
									<div class="form-group">
										<label class="form-label">First Name</label>
										<input
											type="text"
											class="form-input"
											bind:value={editForm.first_name}
											placeholder="First Name"
										/>
									</div>

									<div class="form-group">
										<label class="form-label">Last Name</label>
										<input
											type="text"
											class="form-input"
											bind:value={editForm.last_name}
											placeholder="Last Name"
										/>
									</div>
								</div>

								<div class="form-actions">
									<Button variant="primary" onclick={handleUpdate}>Save Changes</Button>
									<Button variant="secondary" onclick={() => (isEditing = false)}>Cancel</Button>
								</div>
							</div>
						{:else}
							<div class="info-display">
								<h2>{user.first_name} {user.last_name}</h2>
								<p class="username">@{user.username}</p>

								<div class="info-grid">
									<div class="info-item">
										<span class="info-label">📧 Email</span>
										<span class="info-value">{user.email}</span>
									</div>

									<div class="info-item">
										<span class="info-label">👥 Role</span>
										<span class="info-value">
											{getUserRole() === 'professor' ? 'Professor' : 'Student'}
										</span>
									</div>

									<div class="info-item">
										<span class="info-label">🆔 User ID</span>
										<span class="info-value">{user.pk}</span>
									</div>
								</div>

								<div class="actions">
									<Button variant="primary" onclick={() => (isEditing = true)}>
										✏️ Edit Profile
									</Button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</Card>

			<div class="quick-links">
				<h3>Quick Links</h3>
				<div class="grid grid-3">
					<Card>
						<a href="/reservations" class="quick-link">
							<div class="link-icon">📅</div>
							<h4>Your Reservations</h4>
							<p>View and manage</p>
						</a>
					</Card>

					<Card>
						<a href="/spaces" class="quick-link">
							<div class="link-icon">📍</div>
							<h4>Find Spaces</h4>
							<p>Find available spaces</p>
						</a>
					</Card>

					<Card>
						<a href="/buildings" class="quick-link">
							<div class="link-icon">🏛️</div>
							<h4>Buildings</h4>
							<p>Explore buildings</p>
						</a>
					</Card>
				</div>
			</div>
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

	.profile-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.profile-card {
		padding: var(--spacing-xl);
	}

	.profile-avatar {
		display: flex;
		justify-content: center;
		margin-bottom: var(--spacing-xl);
	}

	.avatar-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 700;
	}

	.profile-info {
		text-align: center;
	}

	.info-display h2 {
		margin-bottom: var(--spacing-xs);
	}

	.username {
		color: var(--color-text-secondary);
		font-size: 1.125rem;
		margin-bottom: var(--spacing-xl);
	}

	.info-grid {
		display: grid;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		text-align: left;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md);
		background-color: var(--color-bg-secondary);
		border-radius: var(--radius-md);
	}

	.info-label {
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.info-value {
		font-weight: 500;
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: var(--spacing-md);
	}

	.edit-form {
		text-align: left;
		max-width: 500px;
		margin: 0 auto;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		margin-top: var(--spacing-lg);
	}

	.quick-links {
		margin-top: var(--spacing-2xl);
	}

	.quick-links h3 {
		margin-bottom: var(--spacing-lg);
		text-align: center;
	}

	.quick-link {
		display: block;
		text-align: center;
		padding: var(--spacing-lg);
		text-decoration: none;
		color: var(--color-text-primary);
		transition: transform var(--transition-fast);
	}

	.quick-link:hover {
		transform: translateY(-4px);
	}

	.link-icon {
		font-size: 3rem;
		margin-bottom: var(--spacing-md);
	}

	.quick-link h4 {
		margin-bottom: var(--spacing-xs);
	}

	.quick-link p {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.avatar-circle {
			width: 100px;
			height: 100px;
			font-size: 2.5rem;
		}
	}
</style>
