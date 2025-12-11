<script lang="ts">
	interface Props {
		value: string;
		label?: string;
		id?: string;
		type?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		[key: string]: any;
	}

	let {
		value = $bindable(),
		label,
		id,
		type = 'text',
		placeholder = '',
		disabled = false,
		required = false,
		error = '',
		...rest
	}: Props = $props();
</script>

<div class="input-group">
	{#if label}
		<label for={id}>
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}

	<input
		{id}
		{type}
		bind:value
		{placeholder}
		{disabled}
		{required}
		class:has-error={!!error}
		{...rest}
	/>

	{#if error}
		<span class="error-text">{error}</span>
	{/if}
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-primary);
    }

    .required {
        color: var(--color-error);
        margin-left: 2px;
    }

    input {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        font-size: 1rem;
        transition: all 0.2s;
        box-sizing: border-box;
    }

    input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-transparent);
        background: var(--color-bg-primary);
    }

    input:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    input.has-error {
        border-color: var(--color-error);
    }

    input.has-error:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .error-text {
        color: var(--color-error);
        font-size: 0.8rem;
        margin-top: -0.25rem;
    }
</style>
