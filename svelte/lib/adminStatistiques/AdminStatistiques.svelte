<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminStatistiques.api';
  import type { Statistiques } from './adminStatistiques.types';

  let statistiques: Statistiques | undefined = $state();

  onMount(async () => {
    statistiques = await api.statistiques();
  });
</script>

<h1>Statistiques</h1>
{#if statistiques}
  <pre>{JSON.stringify(statistiques, null, 2)}</pre>
{/if}

<style lang="scss">
  :global(#conteneur-admin-statistiques) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 20px;
    overflow: auto;
  }

  :global(main) {
    background: white;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }
</style>
