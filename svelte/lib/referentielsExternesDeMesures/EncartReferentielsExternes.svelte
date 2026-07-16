<script lang="ts">
  import {
    LIBELLES_REFERENTIELS_EXTERNES,
    type ReferentielExterne,
  } from './referentielsExternes';

  interface Props {
    donnees: Record<ReferentielExterne, Array<{ id: string }>>;
  }

  let { donnees }: Props = $props();

  let nomsDesReferentiels: Array<string> = $derived.by(() => {
    if (!donnees) return [];

    return Object.entries(donnees)
      .filter(([, items]) => items.length > 0)
      .map(
        ([cle]) => LIBELLES_REFERENTIELS_EXTERNES[cle as ReferentielExterne]
      );
  });

  let aDesReferentielsExternes = $derived(nomsDesReferentiels.length > 0);
</script>

{#if aDesReferentielsExternes}
  <span class="referentiels-externes">
    Correspond à {nomsDesReferentiels.join(', ')}
  </span>
{/if}

<style lang="scss">
  .referentiels-externes {
    font-size: 0.75rem;
    font-style: italic;
    font-weight: normal;
    line-height: 1.125rem;
  }
</style>
