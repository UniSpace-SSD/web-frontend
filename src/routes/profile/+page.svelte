<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth';
	import { api, DEPARTMENTS } from '$lib/services/api';
	import type { User, Department } from '$lib/services/api';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import { snackbar } from '$lib/stores/snackbar';

	let user = $state<User | null>(null);
	let isEditing = $state(false);
	let loading = $state(true);

	let editForm = $state({
		first_name: '',
		last_name: '',
		username: '',
		department: '' as Department
	});

	onMount(async () => {
		currentUser.subscribe((value) => {
			user = value;
			if (user) {
				editForm = {
					first_name: user.first_name || '',
					last_name: user.last_name || '',
					username: user.username,
					department: user.department
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
		if (user?.is_superuser) return 'admin';
		return user?.role || 'student';
	}

	function getUserRoleLabel(): string {
		const role = getUserRole();
		if (role === 'admin') return 'Administrator';
		return role === 'professor' ? 'Professor' : 'Student';
	}
</script>

<svelte:head>
	<title>Profile - UniSpace</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>👤 Your Profile</h1>
		<p>Review and update your personal information and account details.</p>
	</div>

	{#if loading}
		<div class="loading">
			<div class="loader"></div>
		</div>
	{:else if user}
		<div class="profile-content">
			<Card>
				<div class="profile-card">
					<div class="profile-main">
						<div class="profile-avatar">
							<div class="avatar-circle">
								{user.first_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
							</div>
							<div class="role-badge">
								<span class="role-dot"></span>
								<span>{getUserRoleLabel()}</span>
							</div>
						</div>

						<div class="profile-info">
							{#if isEditing}
								<div class="edit-form">
									<h2>Edit profile</h2>
									<p class="edit-subtitle">Update your public information shown across UniSpace.</p>

									<div class="form-group-wrapper">
										<Input
											id="username"
											label="Username"
											bind:value={editForm.username}
											placeholder="Username"
										/>
									</div>

									<div class="form-row">
										<div class="form-group-wrapper">
											<Input
												id="first_name"
												label="First Name"
												bind:value={editForm.first_name}
												placeholder="First Name"
											/>
										</div>

										<div class="form-group-wrapper">
											<Input
												id="last_name"
												label="Last Name"
												bind:value={editForm.last_name}
												placeholder="Last Name"
											/>
										</div>
									</div>

									<div class="form-group-wrapper">
										<Select
											id="department"
											label="Department"
											bind:value={editForm.department}
											options={DEPARTMENTS}
										/>
									</div>

									<div class="form-actions">
										<Button variant="primary" onclick={handleUpdate} disabled={loading}>
											{#if loading}Saving...{:else}Save Changes{/if}
										</Button>
										<Button
											variant="secondary"
											onclick={() => (isEditing = false)}
											disabled={loading}
										>
											Cancel
										</Button>
									</div>
								</div>
							{:else}
								<div class="info-display">
									<div class="info-header">
										<div class="name-block">
											<h2>{user.first_name} {user.last_name}</h2>
											<p class="username">@{user.username}</p>
										</div>
										<div class="info-chips">
											<span class="chip">
												<span class="chip-icon">🎓</span>
												{getUserRoleLabel()}
											</span>
										</div>
									</div>

									<div class="info-grid">
										<div class="info-item">
											<div class="info-icon">📧</div>
											<div class="info-text">
												<span class="info-label">Email</span>
												<span class="info-value">{user.email}</span>
											</div>
										</div>

										<div class="info-item">
											<div class="info-icon">👥</div>
											<div class="info-text">
												<span class="info-label">Role</span>
												<span class="info-value">{getUserRoleLabel()}</span>
											</div>
										</div>

										<div class="info-item">
											<div class="info-icon">🆔</div>
											<div class="info-text">
												<span class="info-label">User ID</span>
												<span class="info-value">{user.pk}</span>
											</div>
										</div>

										<div class="info-item">
											<div class="info-icon">🏢</div>
											<div class="info-text">
												<span class="info-label">Department</span>
												<span class="info-value">{user.department}</span>
											</div>
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
				</div>
			</Card>
		</div>
	{/if}
</div>

<style>
    .page-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }

    .page-header h1 {
        margin-bottom: var(--spacing-xs);
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
        max-width: 900px;
        margin: 0 auto;
    }

    .profile-card {
        padding: var(--spacing-xl);
    }

    .profile-main {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
        gap: var(--spacing-xl);
        align-items: center;
    }

    .profile-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
    }

    .avatar-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background:
                radial-gradient(circle at 30% 0%, #ffffff, rgba(255, 255, 255, 0.3)),
                linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: 700;
        box-shadow: 0 18px 35px rgba(0, 0, 0, 0.35);
    }

    .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background-color: var(--color-bg-secondary);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.8rem;
        color: var(--color-text-secondary);
    }

    .role-dot {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: var(--color-primary);
    }

    .profile-info {
        text-align: left;
    }

    .info-display h2 {
        margin-bottom: var(--spacing-2xs);
    }

    .info-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    .name-block h2 {
        margin: 0;
    }

    .username {
        color: var(--color-text-secondary);
        font-size: 1.05rem;
        margin-top: var(--spacing-2xs);
    }

    .info-chips {
        display: flex;
        gap: var(--spacing-xs);
        align-items: center;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        background-color: var(--color-bg-secondary);
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        border: 1px solid rgba(255, 255, 255, 0.06);
        white-space: nowrap;
    }

    .chip-icon {
        font-size: 0.9rem;
    }

    .info-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .info-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--color-bg-secondary);
        border-radius: var(--radius-md);
    }

    .info-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-bg-tertiary, rgba(255, 255, 255, 0.04));
        font-size: 1.3rem;
    }

    .info-text {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .info-label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-secondary);
    }

    .info-value {
        font-weight: 500;
    }

    .actions {
        display: flex;
        justify-content: flex-start;
        gap: var(--spacing-md);
    }

    .edit-form {
        max-width: 520px;
    }

    .edit-form h2 {
        margin-bottom: var(--spacing-2xs);
    }

    .edit-subtitle {
        margin-bottom: var(--spacing-lg);
        color: var(--color-text-secondary);
        font-size: 0.95rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }

    .form-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-start;
        margin-top: var(--spacing-lg);
    }

    @media (max-width: 900px) {
        .profile-main {
            grid-template-columns: minmax(0, 1fr);
            text-align: center;
        }

        .profile-info {
            text-align: left;
        }

        .info-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .actions {
            justify-content: center;
        }

        .profile-avatar {
            margin-bottom: var(--spacing-md);
        }
    }

    @media (max-width: 768px) {
        .avatar-circle {
            width: 100px;
            height: 100px;
            font-size: 2.5rem;
        }

        .form-row {
            grid-template-columns: 1fr;
        }
    }
</style>
