<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    titre: string;
    children: Snippet;
  }

  let { titre, children }: Props = $props();
</script>

<div class="graphique">
  <h2>{titre}</h2>
  {@render children()}
</div>

<style lang="scss">
  .graphique {
    border: 1px solid var(--liseres-fonce);
    padding: 16px;

    h2 {
      margin: 0 0 24px;
    }
  }
</style>
