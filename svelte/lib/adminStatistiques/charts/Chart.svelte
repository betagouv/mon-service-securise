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
    padding: 40px;
    border-radius: 4px;
    border: 1px solid #ddd;

    h2 {
      color: #282828;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.75rem;
      margin: 0 0 24px;
    }
  }
</style>
