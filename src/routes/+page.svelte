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
		<div class="hero-inner">
			<div class="hero-content">
				<div class="hero-badge">
					<span class="dot"></span>
					<span>University space management</span>
				</div>

				<h1>🎓 Welcome to UniSpace</h1>
				<p class="hero-subtitle">Smart booking for classrooms, labs and study spaces</p>

				<p class="hero-description">
					UniSpace is the central hub for managing university spaces: one place to explore buildings,
					check availability and book the room that fits your needs.
				</p>

				<p class="hero-description hero-description-secondary">
					Students reserve study areas in a few clicks, professors organize lessons and exams with clear
					schedules, and admin staff keep full visibility on everyday room usage.
				</p>

				<div class="hero-actions">
					{#if isAuth}
						<a href="/spaces" class="btn btn-primary">Explore Spaces</a>
						<a href="/reservations" class="btn btn-secondary">Your Reservations</a>
					{:else}
						<a href="/auth/register" class="btn btn-primary">Sign Up</a>
						<a href="/auth/login" class="btn btn-secondary">Login</a>
					{/if}
				</div>

				<div class="hero-meta">
					<div class="meta-item">
						<span class="meta-label">For students</span>
						<span class="meta-value">Quick study room booking</span>
					</div>
					<div class="meta-divider"></div>
					<div class="meta-item">
						<span class="meta-label">For professors</span>
						<span class="meta-value">Lesson & exam scheduling</span>
					</div>
					<div class="meta-divider"></div>
					<div class="meta-item">
						<span class="meta-label">For staff</span>
						<span class="meta-value">Centralized space overview</span>
					</div>
				</div>
			</div>

			<div class="hero-visual">
				<div class="visual-card">
					<div class="visual-header">
						<span class="pill">Today’s snapshot</span>
					</div>
					<div class="visual-stats">
						<div class="visual-stat">
							<span class="visual-label">Active reservations</span>
							<span class="visual-number">24</span>
						</div>
						<div class="visual-stat">
							<span class="visual-label">Available spaces</span>
							<span class="visual-number">12</span>
						</div>
						<div class="visual-stat">
							<span class="visual-label">Buildings</span>
							<span class="visual-number">5</span>
						</div>
					</div>
					<div class="visual-footer">
						<span class="dot small"></span>
						<span class="visual-caption">Live data from UniSpace API</span>
					</div>
				</div>
				<div class="hero-glow"></div>
			</div>
		</div>
	</section>
</div>

<style>
	.hero {
		padding: var(--spacing-2xl) 0 var(--spacing-3xl);
		margin-bottom: var(--spacing-2xl);
		position: relative;
	}

	.hero-inner {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1.6fr);
		gap: var(--spacing-2xl);
		align-items: center;
	}

	.hero-content {
		max-width: 680px;
		margin: 0 auto;
		text-align: left;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		font-size: 0.8rem;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-secondary);
		backdrop-filter: blur(10px);
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--color-primary);
		box-shadow: 0 0 10px rgba(0, 200, 150, 0.6);
	}

	.dot.small {
		width: 0.4rem;
		height: 0.4rem;
		box-shadow: none;
	}

	.hero h1 {
		font-size: 3rem;
		margin-bottom: var(--spacing-sm);
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.3rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.hero-description {
		font-size: 1.05rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.hero-description-secondary {
		opacity: 0.9;
		margin-bottom: var(--spacing-xl);
	}

	.hero-actions {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
		margin-bottom: var(--spacing-lg);
	}

	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-md);
		padding-top: var(--spacing-sm);
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.meta-label {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-secondary);
	}

	.meta-value {
		font-size: 0.9rem;
		color: var(--color-text);
		white-space: nowrap;
	}

	.meta-divider {
		width: 1px;
		height: 2rem;
		background: rgba(255, 255, 255, 0.08);
	}

	.hero-visual {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.visual-card {
		position: relative;
		width: 100%;
		max-width: 360px;
		padding: var(--spacing-lg);
		border-radius: 1.5rem;
		background: radial-gradient(circle at top left, rgba(0, 200, 150, 0.14), transparent 55%),
			radial-gradient(circle at bottom right, rgba(80, 130, 255, 0.18), transparent 55%),
			var(--color-bg-secondary);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.visual-header {
		display: flex;
		justify-content: flex-start;
	}

	.pill {
		font-size: 0.78rem;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.3);
		color: var(--color-text-secondary);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.visual-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--spacing-md);
	}

	.visual-stat {
		padding: 0.7rem 0.8rem;
		border-radius: 0.9rem;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.visual-stat:nth-child(3) {
		grid-column: span 2;
	}

	.visual-label {
		font-size: 0.78rem;
		color: var(--color-text-secondary);
	}

	.visual-number {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.visual-footer {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		color: var(--color-text-secondary);
		margin-top: var(--spacing-sm);
	}

	.hero-glow {
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background: radial-gradient(circle at 20% 0%, rgba(0, 200, 150, 0.4), transparent 55%);
		opacity: 0.6;
		filter: blur(30px);
		z-index: -1;
	}

	@media (max-width: 900px) {
		.hero-inner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--spacing-xl);
		}

		.hero-content {
			text-align: center;
		}

		.hero-meta {
			justify-content: center;
		}

		.meta-divider {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.hero {
			padding: var(--spacing-xl) 0 var(--spacing-2xl);
		}

		.hero h1 {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.hero-description,
		.hero-description-secondary {
			font-size: 0.95rem;
		}

		.visual-card {
			max-width: 100%;
		}
	}
</style>
