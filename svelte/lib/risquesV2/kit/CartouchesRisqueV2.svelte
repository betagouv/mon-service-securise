<script lang="ts">
  import { mappingNomCategories } from './kit';
  import type { Risque } from '../risquesV2.d';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();
</script>

<div class="tags">
  <dsfr-tag label="ANSSI"></dsfr-tag>
  {#each risque.categories as categorie (categorie)}
    <dsfr-tag label={mappingNomCategories[categorie]}></dsfr-tag>
  {/each}
</div>

<style lang="scss">
  .tags {
    display: flex;
    gap: 8px;
  }
</style>
