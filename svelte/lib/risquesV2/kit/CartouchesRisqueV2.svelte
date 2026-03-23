<script lang="ts">
  import { mappingNomCategories } from './kit';

  interface Props {
    risque: {
      categories: string[];
    };
    risqueAjoute?: boolean;
  }

  let { risque, risqueAjoute = false }: Props = $props();
</script>

<div class="tags">
  <dsfr-tag label={risqueAjoute ? 'Risque ajouté' : 'ANSSI'}></dsfr-tag>
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
