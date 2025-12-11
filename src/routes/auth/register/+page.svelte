<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { DEPARTMENTS, type Department } from '$lib/services/api';
	import { fade, fly } from 'svelte/transition';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';

	let formData = $state({
		username: '',
		email: '',
		password1: '',
		password2: '',
		first_name: '',
		last_name: '',
		date_of_birth: '',
		role: 'student' as 'student' | 'professor',
		department: '' as Department | ''
	});

	let error = $state('');
	let success = $state(false);
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!formData.username || !formData.email || !formData.password1 || !formData.password2) {
			error = 'Please fill in all required fields';
			return;
		}

		if (!formData.department) {
			error = 'Please select a department';
			return;
		}

		if (formData.password1 !== formData.password2) {
			error = 'Passwords do not match';
			return;
		}

		if (formData.password1.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
			error = 'Please fill in all required fields';
			return;
		}

		isLoading = true;

		try {
			await authStore.register(formData as any); // Cast to any because formData.department is string | empty, but API expects strict Department

			if (typeof window !== 'undefined') {
				localStorage.setItem('user_role', formData.role);
				localStorage.setItem('user_department', formData.department);
			}
			success = true;

			setTimeout(() => {
				goto('/auth/login');
			}, 2000);
		} catch (err: any) {
			error = err.message || 'Registration failed. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="page-container">
	<div class="background-decorations">
		<div class="blob blob-1"></div>
		<div class="blob blob-2"></div>
	</div>

	<div class="content-wrapper" in:fly={{ y: 20, duration: 600 }}>
		<Card glass={true}>
			<div class="header">
				<h1>Create Account</h1>
				<p>Join UniSpace to manage your campus life</p>
			</div>

			{#if error}
				<div class="alert error" transition:fade>
					<span class="icon">⚠️</span>
					{error}
				</div>
			{/if}

			{#if success}
				<div class="alert success" transition:fade>
					<span class="icon">✅</span>
					Registration successful! Redirecting...
				</div>
			{:else}
				<form onsubmit={handleSubmit}>
					<div class="form-container">
						<div class="form-grid">
							<Input
								id="first_name"
								label="First Name"
								bind:value={formData.first_name}
								placeholder="John"
								disabled={isLoading}
								required
							/>
							<Input
								id="last_name"
								label="Last Name"
								bind:value={formData.last_name}
								placeholder="Doe"
								disabled={isLoading}
								required
							/>
						</div>

						<Input
							id="username"
							label="Username"
							bind:value={formData.username}
							placeholder="johndoe"
							disabled={isLoading}
							required
						/>

						<Input
							id="email"
							type="email"
							label="Email Address"
							bind:value={formData.email}
							placeholder="john@university.edu"
							disabled={isLoading}
							required
						/>

						<div class="form-grid">
							<Input
								id="date_of_birth"
								type="date"
								label="Date of Birth"
								bind:value={formData.date_of_birth}
								disabled={isLoading}
								required
							/>

							<Select
								id="role"
								label="Role"
								bind:value={formData.role}
								disabled={isLoading}
								required
								options={[
									{ value: 'student', label: 'Student' },
									{ value: 'professor', label: 'Professor' }
								]}
							/>
						</div>

						<Select
							id="department"
							label="Department"
							bind:value={formData.department}
							disabled={isLoading}
							required
							placeholder="Select your department"
							options={DEPARTMENTS}
						/>

						<div class="form-grid">
							<Input
								id="password"
								type="password"
								label="Password"
								bind:value={formData.password1}
								placeholder="••••••••"
								disabled={isLoading}
								required
							/>

							<Input
								id="confirm_password"
								type="password"
								label="Confirm Password"
								bind:value={formData.password2}
								placeholder="••••••••"
								disabled={isLoading}
								required
							/>
						</div>

						<Button type="submit" variant="primary" disabled={isLoading} class="w-full">
							{#if isLoading}
								<div class="loader-text">
									<div class="loader"></div>
									Creating account...
								</div>
							{:else}
								Create Account
							{/if}
						</Button>

						<p class="login-link">
							Already have an account? <a href="/auth/login">Log in</a>
						</p>
					</div>
				</form>
			{/if}
		</Card>
	</div>
</div>
<style>
    :global(body) {
        margin: 0;
        font-family: 'Inter', sans-serif;
    }

    .page-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        padding: var(--spacing-md);
        background-color: var(--color-bg-primary);
    }

    .background-decorations {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        opacity: 0.6;
        pointer-events: none;
    }

    .blob {
        position: absolute;
        filter: blur(80px);
        opacity: 0.4;
        border-radius: 50%;
        animation: float 20s infinite ease-in-out;
    }

    .blob-1 {
        top: -10%;
        left: -10%;
        width: 500px;
        height: 500px;
        background: var(--color-primary);
        animation-delay: 0s;
    }

    .blob-2 {
        bottom: -10%;
        right: -10%;
        width: 600px;
        height: 600px;
        background: var(--color-secondary);
        animation-delay: -5s;
    }

    .content-wrapper {
        width: 100%;
        max-width: 600px;
        position: relative;
        z-index: 1;
    }

    .header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }

    h1 {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: var(--spacing-xs);
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .header p {
        color: var(--color-text-secondary);
        font-size: 1.1rem;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }



    .loader-text {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .loader {
        width: 20px;
        height: 20px;
        border: 2px solid white;
        border-bottom-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .alert {
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.95rem;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--color-error);
        color: var(--color-error);
    }

    .alert.success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid var(--color-success);
        color: var(--color-success);
    }

    .login-link {
        text-align: center;
        margin-top: var(--spacing-lg);
        color: var(--color-text-secondary);
        font-size: 0.95rem;
    }

    .login-link a {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;
        transition: color 0.2s;
    }

    .login-link a:hover {
        color: var(--color-primary-dark);
        text-decoration: underline;
    }

    @keyframes float {
        0%,
        100% {
            transform: translate(0, 0);
        }
        33% {
            transform: translate(30px, -50px);
        }
        66% {
            transform: translate(-20px, 20px);
        }
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 600px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .page-container {
            padding: var(--spacing-sm);
            align-items: flex-start;
        }

        .content-wrapper {
            margin-top: var(--spacing-xl);
        }
    }
</style>