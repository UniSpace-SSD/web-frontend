<script lang="ts">
  interface Props {
    children: any;
  }

  let { children }: Props = $props();
</script>

<div class="card fade-in">
  {@render children()}
</div>
