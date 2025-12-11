<script lang="ts">
	interface Props {
		children?: any;
		variant?: 'primary' | 'secondary' | 'danger';
		[key: string]: any;
	}

	let { children, variant = 'primary', class: className = '', ...rest }: Props = $props();

	const classMap = {
		primary: 'btn btn-primary',
		secondary: 'btn btn-secondary',
		danger: 'btn btn-danger'
	};
</script>

<button
	class="{classMap[variant]} {rest.disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}"
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1.5rem;
        border-radius: 999px;
        font-weight: 600;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
        font-size: 0.95rem;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .btn-primary {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        transform: translateY(-1px);
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.8);
        color: var(--color-text-primary);
        border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .btn-secondary:hover:not(:disabled) {
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    :global([data-theme='dark']) .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    :global([data-theme='dark']) .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
    }

    .btn-danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--color-error);
        border: 1px solid var(--color-error);
    }

    .btn-danger:hover:not(:disabled) {
        background: var(--color-error);
        color: white;
    }
</style>
