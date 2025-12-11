<script lang="ts">
	interface Props {
		status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';
		variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'default';
		children?: any;
	}

	let { status, variant = 'default', children }: Props = $props();

	let finalVariant = $derived.by(() => {
		if (variant !== 'default') return variant;
		if (!status) return 'primary';

		switch (status) {
			case 'PENDING':
				return 'warning';
			case 'CONFIRMED':
				return 'success';
			case 'CANCELLED':
			case 'REJECTED':
				return 'danger';
			case 'EXPIRED':
				return 'secondary';
			default:
				return 'primary';
		}
	});

	const classMap: Record<string, string> = {
		primary: 'badge badge-primary',
		secondary: 'badge badge-secondary',
		outline: 'badge badge-outline',
		danger: 'badge badge-danger',
		success: 'badge badge-success',
		warning: 'badge badge-warning'
	};
</script>

<span class="{classMap[finalVariant]} badge-pill">
	{#if children}
		{@render children()}
	{:else}
		{status}
	{/if}
</span>

<style>
    .badge-pill {
        display: inline-block;
        padding: 0.35em 1em;
        font-size: 0.75em;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 999px;
        letter-spacing: 0.05em;
        transition: all 0.2s;
    }

    .badge-primary {
        background-color: var(--color-primary, #3b82f6);
        color: white;
    }

    .badge-secondary {
        background-color: var(--color-bg-secondary);
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border);
    }

    .badge-outline {
        background-color: transparent;
        color: var(--color-primary);
        border: 1px solid var(--color-primary);
    }

    .badge-warning {
        background-color: var(--color-warning, #f59e0b);
        color: white;
    }

    .badge-success {
        background-color: var(--color-success, #10b981);
        color: white;
    }

    .badge-danger {
        background-color: var(--color-error, #ef4444);
        color: white;
    }
</style>
