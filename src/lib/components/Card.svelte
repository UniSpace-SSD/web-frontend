<script lang="ts">
	interface Props {
		children: any;
		class?: string;
		glass?: boolean;
	}

	let { children, class: className = '', glass = true }: Props = $props();
</script>

<div class="card {glass ? 'card-glass' : ''} fade-in {className}">
	{@render children()}
</div>

<style>
    .card {
        background: var(--color-bg-secondary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        transition:
                transform 0.2s,
                box-shadow 0.2s;
    }

    .card-glass {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
    }

    :global([data-theme='dark']) .card-glass {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>
