<script lang="ts">
	import '../styles.scss';
	import { onMount } from 'svelte';
	import { authStore, isAuthenticated, isAdmin } from '$lib/stores/auth';
	import { themeStore } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import Snackbar from '$lib/components/Snackbar.svelte';
	import Background from '$lib/components/Background.svelte';

	let { children } = $props();

	let theme = $state('light');
	let isAuth = $state(false);
	let isAdminUser = $state(false);
	let mobileMenuOpen = $state(false);

	onMount(() => {
		themeStore.initialize();
		authStore.checkAuth();

		themeStore.subscribe((value) => {
			theme = value;
		});

		isAuthenticated.subscribe((value) => {
			isAuth = value;
		});

		isAdmin.subscribe((value) => {
			isAdminUser = value;
		});
	});

	function toggleTheme() {
		themeStore.toggle();
	}

	function handleLogout() {
		authStore.logout();
		goto('/');
		mobileMenuOpen = false;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="app">
	<nav class="navbar">
		<div class="container">
			<div class="nav-content">
				<a href="/" class="nav-brand">
					<span class="brand-icon">🎓</span>
					<span class="brand-text">UniSpace</span>
				</a>

				<button class="mobile-menu-btn" onclick={() => (mobileMenuOpen = !mobileMenuOpen)}>
					<span></span>
					<span></span>
					<span></span>
				</button>

				<div class="nav-links" class:mobile-open={mobileMenuOpen}>
					<a href="/buildings" onclick={closeMobileMenu}>Buildings</a>
					<a href="/spaces" onclick={closeMobileMenu}>Spaces</a>
					{#if isAuth}
						{#if !isAdminUser}
							<a href="/reservations" onclick={closeMobileMenu}>Reservations</a>
						{:else}
							<a href="/admin" onclick={closeMobileMenu}>Admin</a>
						{/if}
						<a href="/profile" onclick={closeMobileMenu}>Profile</a>
					{/if}
					<div class="nav-actions">
						<button class="theme-toggle" onclick={toggleTheme} title="Toggle theme">
							{#if theme === 'dark'}
								☀️
							{:else}
								🌙
							{/if}
						</button>

						{#if isAuth}
							<button class="btn btn-secondary" onclick={handleLogout}>Logout</button>
						{:else}
							<a href="/auth/login" class="btn btn-primary" onclick={closeMobileMenu}>Login</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</nav>

	<main class="main-content">
		{@render children()}
	</main>

	<footer class="footer">
		<div class="container">
			<p>&copy; 2025 UniSpace. University space reservation system.</p>
		</div>
	</footer>

	<Snackbar />
	<Background />
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .navbar {
        background-color: var(--color-card-bg);
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: var(--shadow-sm);
    }

    .nav-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) 0;
    }

    .nav-brand {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text-primary);
        text-decoration: none;
        transition: color var(--transition-fast);
    }

    .nav-brand:hover {
        color: var(--color-primary);
    }

    .brand-icon {
        font-size: 2rem;
    }

    .mobile-menu-btn {
        display: none;
        flex-direction: column;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--spacing-sm);
    }

    .mobile-menu-btn span {
        width: 24px;
        height: 2px;
        background-color: var(--color-text-primary);
        transition: all var(--transition-fast);
    }

    .nav-links {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
    }

    .nav-links a {
        color: var(--color-text-secondary);
        font-weight: 500;
        transition: color var(--transition-fast);
        position: relative;
    }

    .nav-links a:hover {
        color: var(--color-primary);
    }

    .nav-links a::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--color-primary);
        transition: width var(--transition-fast);
    }

    .nav-links a:hover::after {
        width: 100%;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-left: var(--spacing-md);
    }

    .theme-toggle {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        transition: background-color var(--transition-fast);
    }

    .theme-toggle:hover {
        background-color: var(--color-bg-tertiary);
    }

    .main-content {
        flex: 1;
        padding: var(--spacing-2xl) 0;
    }

    .footer {
        background-color: var(--color-bg-secondary);
        border-top: 1px solid var(--color-border);
        padding: var(--spacing-xl) 0;
        margin-top: var(--spacing-2xl);
    }

    .footer p {
        text-align: center;
        color: var(--color-text-secondary);
        margin: 0;
    }

    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: flex;
        }

        .nav-links {
            position: fixed;
            top: 73px;
            right: 0;
            width: 250px;
            height: calc(100vh - 73px);
            background-color: var(--color-card-bg);
            border-left: 1px solid var(--color-border);
            flex-direction: column;
            align-items: flex-start;
            padding: var(--spacing-lg);
            gap: var(--spacing-md);
            transform: translateX(100%);
            transition: transform var(--transition-base);
            box-shadow: var(--shadow-lg);
        }

        .nav-links.mobile-open {
            transform: translateX(0);
        }

        .nav-links a::after {
            display: none;
        }

        .nav-actions {
            flex-direction: column;
            width: 100%;
            margin-left: 0;
            margin-top: var(--spacing-md);
        }

        .nav-actions .btn {
            width: 100%;
        }
    }
</style>
