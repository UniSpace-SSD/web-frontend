<script lang="ts">
	interface Option {
		value: string | number;
		label: string;
	}

	interface Props {
		value: any;
		label?: string;
		id?: string;
		options?: Option[] | string[];
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		children?: any;
		[key: string]: any;
	}

	let {
		value = $bindable(),
		label,
		id,
		options = [],
		placeholder = 'Select an option',
		disabled = false,
		required = false,
		error = '',
		children,
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

	<div class="select-wrapper">
		<select {id} bind:value {disabled} {required} class:has-error={!!error} {...rest}>
			{#if placeholder}
				<option value="" disabled selected>{placeholder}</option>
			{/if}

			{#if children}
				{@render children()}
			{:else}
				{#each options as option}
					{#if typeof option === 'string'}
						<option value={option}>{option}</option>
					{:else}
						<option value={option.value}>{option.label}</option>
					{/if}
				{/each}
			{/if}
		</select>
		<div class="arrow">▼</div>
	</div>

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

    .select-wrapper {
        position: relative;
        width: 100%;
    }

    select {
        width: 100%;
        padding: 0.75rem 1rem;
        padding-right: 2.5rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        font-size: 1rem;
        transition: all 0.2s;
        appearance: none;
        cursor: pointer;
        box-sizing: border-box;
    }

    select:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-transparent);
        background: var(--color-bg-primary);
    }

    select:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    select.has-error {
        border-color: var(--color-error);
    }

    select.has-error:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .arrow {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
    }

    .error-text {
        color: var(--color-error);
        font-size: 0.8rem;
        margin-top: -0.25rem;
    }
</style>
