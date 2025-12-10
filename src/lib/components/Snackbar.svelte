<script lang="ts">
	import { snackbar } from '$lib/stores/snackbar';
	import { fly } from 'svelte/transition';

	let snackbars = $state<any[]>([]);

	$effect(() => {
		const unsubscribe = snackbar.subscribe((value) => {
			snackbars = value;
		});
		return unsubscribe;
	});

	function handleClose(id: string) {
		snackbar.remove(id);
	}
</script>

<div class="snackbar-container">
	{#each snackbars as item (item.id)}
		<div class="snackbar snackbar-{item.severity}" transition:fly={{ y: 50, duration: 300 }}>
			<div class="snackbar-content">
				<span class="snackbar-icon">
					{#if item.severity === 'success'}
						✅
					{:else if item.severity === 'error'}
						❌
					{:else if item.severity === 'warning'}
						⚠️
					{:else}
						ℹ️
					{/if}
				</span>
				<span class="snackbar-message">{item.message}</span>
			</div>
			<button class="snackbar-close" onclick={() => handleClose(item.id)}>×</button>
		</div>
	{/each}
</div>

<style>
	.snackbar-container {
		position: fixed;
		bottom: var(--spacing-lg);
		right: var(--spacing-lg);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		max-width: 400px;
	}

	.snackbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		min-width: 300px;
		backdrop-filter: blur(10px);
	}

	.snackbar-success {
		background: rgba(16, 185, 129, 0.95);
		color: white;
		border: 2px solid #10b981;
	}

	.snackbar-error {
		background: rgba(239, 68, 68, 0.95);
		color: white;
		border: 2px solid #ef4444;
	}

	.snackbar-warning {
		background: rgba(245, 158, 11, 0.95);
		color: white;
		border: 2px solid #f59e0b;
	}

	.snackbar-info {
		background: rgba(59, 130, 246, 0.95);
		color: white;
		border: 2px solid #3b82f6;
	}

	.snackbar-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex: 1;
	}

	.snackbar-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.snackbar-message {
		font-weight: 500;
		font-size: 0.9rem;
	}

	.snackbar-close {
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: background-color 0.2s;
		flex-shrink: 0;
	}

	.snackbar-close:hover {
		background-color: rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 768px) {
		.snackbar-container {
			left: var(--spacing-md);
			right: var(--spacing-md);
			bottom: var(--spacing-md);
			max-width: none;
		}

		.snackbar {
			min-width: auto;
		}
	}
</style>
