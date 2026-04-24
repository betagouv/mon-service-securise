<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<p>
  {@render children()}
</p>

<style lang="scss">
  p {
    color: #3a3a3a;
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
</style>
