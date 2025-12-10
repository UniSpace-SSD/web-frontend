<script lang="ts">
	import { isAuthenticated } from '$lib/stores/auth';

	let isAuth = $state(false);

	$effect(() => {
		isAuthenticated.subscribe((value) => {
			isAuth = value;
		});
	});
</script>

<div class="container">
	<section class="hero">
		<div class="hero-content">
			<h1>🎓 Welcome to UniSpace</h1>
			<p class="hero-subtitle">University space management and reservation system</p>
			<div class="hero-actions">
				{#if isAuth}
					<a href="/spaces" class="btn btn-primary">Explore Spaces</a>
					<a href="/reservations" class="btn btn-secondary">Your Reservations</a>
				{:else}
					<a href="/auth/register" class="btn btn-primary">Sign Up</a>
					<a href="/auth/login" class="btn btn-secondary">Login</a>
				{/if}
			</div>
		</div>
	</section>

	<section class="features">
		<h2>Key Features</h2>
		<div class="grid grid-3">
			<div class="feature-card card">
				<div class="feature-icon">🏛️</div>
				<h3>Buildings</h3>
				<p>View all available university buildings with their associated spaces.</p>
				<a href="/buildings" class="feature-link">Explore →</a>
			</div>

			<div class="feature-card card">
				<div class="feature-icon">📍</div>
				<h3>Spaces</h3>
				<p>Search and book spaces: classrooms, labs, meeting rooms, and libraries.</p>
				<a href="/spaces" class="feature-link">Find Spaces →</a>
			</div>

			<div class="feature-card card">
				<div class="feature-icon">📅</div>
				<h3>Reservations</h3>
				<p>Manage your reservations and view your activity history.</p>
				{#if isAuth}
					<a href="/reservations" class="feature-link">Your Reservations →</a>
				{:else}
					<a href="/auth/login" class="feature-link">Login to Reserve →</a>
				{/if}
			</div>
		</div>
	</section>

	<section class="cta">
		<div class="cta-content card">
			<h2>Test the API</h2>
			<p>Explore and test all available API endpoints with our Swagger-like interface.</p>
			<a href="/api-tester" class="btn btn-primary">Open API Tester</a>
		</div>
	</section>
</div>

<style>
	.hero {
		text-align: center;
		padding: var(--spacing-2xl) 0;
		margin-bottom: var(--spacing-2xl);
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero h1 {
		font-size: 3rem;
		margin-bottom: var(--spacing-md);
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.hero-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	.features {
		margin-bottom: var(--spacing-2xl);
	}

	.features h2 {
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}

	.feature-card {
		text-align: center;
		padding: var(--spacing-xl);
		transition: transform var(--transition-base);
	}

	.feature-card:hover {
		transform: translateY(-4px);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: var(--spacing-md);
	}

	.feature-card h3 {
		margin-bottom: var(--spacing-sm);
	}

	.feature-card p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.feature-link {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		transition: gap var(--transition-fast);
	}

	.feature-link:hover {
		gap: var(--spacing-sm);
	}

	.cta {
		margin-bottom: var(--spacing-2xl);
	}

	.cta-content {
		text-align: center;
		padding: var(--spacing-2xl);
		background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary));
	}

	.cta-content h2 {
		margin-bottom: var(--spacing-md);
	}

	.cta-content p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
		font-size: 1.125rem;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}
	}
</style>
