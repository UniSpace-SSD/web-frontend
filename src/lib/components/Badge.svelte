<script lang="ts">
  interface Props {
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';
  }

  let { status }: Props = $props();

  const classMap = {
    PENDING: 'badge badge-pending',
    CONFIRMED: 'badge badge-confirmed',
    CANCELLED: 'badge badge-cancelled',
    REJECTED: 'badge badge-rejected',
    EXPIRED: 'badge badge-expired',
  };
</script>

<span class={classMap[status]}>
  {status}
</span>
