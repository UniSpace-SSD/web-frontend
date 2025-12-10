<script lang="ts">
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: any;
  }

  let { isOpen = $bindable(false), onClose, title, children }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        {#if title}
          <h3>{title}</h3>
        {/if}
        <button class="modal-close" onclick={onClose}>✕</button>
      </div>
      <div class="modal-body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-in-out;
  }

  .modal-content {
    background-color: var(--color-card-bg);
    border-radius: var(--radius-lg);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
    animation: slideIn 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h3 {
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .modal-body {
    padding: var(--spacing-lg);
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
