<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Card from '$lib/components/Card.svelte';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!username || !password) {
			error = 'Username and password are required';
			return;
		}

		isLoading = true;

		try {
			await authStore.login({ username, password });

			goto('/');
		} catch (err: any) {
			error = err.message || 'Login failed. Please check your credentials.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container">
	<div class="login-wrapper">
		<div class="hero-glow"></div>
		<Card class="card-glass">
			<div class="login-content">
				<h1>🎓 Login to UniSpace</h1>
				<p class="subtitle">Access your university space reservations</p>

				{#if error}
					<div class="alert alert-error">
						{error}
					</div>
				{/if}

				<form onsubmit={handleSubmit}>
					<Input
						id="username"
						label="Username or Email"
						bind:value={username}
						placeholder="Enter your username or email"
						disabled={isLoading}
						required
					/>

					<Input
						id="password"
						type="password"
						label="Password"
						bind:value={password}
						placeholder="Enter your password"
						disabled={isLoading}
						required
					/>

					<div class="form-actions">
						<Button type="submit" variant="primary" disabled={isLoading} class="w-full">
							{#if isLoading}
								Logging in...
							{:else}
								Login
							{/if}
						</Button>
					</div>
				</form>

				<div class="footer-links">
					<p>
						Don't have an account?
						<a href="/auth/register">Register here</a>
					</p>
				</div>
			</div>
		</Card>
	</div>
</div>

<style>
    .login-wrapper {
        max-width: 480px;
        margin: 0 auto;
        position: relative;
        padding: var(--spacing-2xl) 0;
    }

    .hero-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120%;
        height: 120%;
        background: radial-gradient(circle at center, rgba(34, 197, 94, 0.15), transparent 60%);
        filter: blur(40px);
        z-index: -1;
        pointer-events: none;
    }

    .login-content {
        text-align: center;
    }

    .login-content h1 {
        margin-bottom: var(--spacing-sm);
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .subtitle {
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-xl);
    }

    form {
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .form-actions {
        display: flex;
        justify-content: center;
        margin-top: var(--spacing-md);
    }

    .form-actions :global(.btn) {
        width: 100%;
    }
</style>
