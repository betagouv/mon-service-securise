<script lang="ts">
  import CartoucheIdentifiantMesure from '../../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../../ui/CartoucheCategorieMesure.svelte';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';
  import DescriptionLongueMesure from '../../ui/DescriptionLongueMesure.svelte';
  import type { ModeleDeMesure } from '../listeMesures.d';
  import CartoucheThematique from '../../ui/CartoucheThematique.svelte';

  export let modeleDeMesure: Omit<
    ModeleDeMesure,
    'type' | 'idsServicesAssocies'
  >;
</script>

<p class="description">{modeleDeMesure.description}</p>
<div class="cartouches">
  <CartoucheReferentiel referentiel={modeleDeMesure.referentiel} />
  <CartoucheCategorieMesure categorie={modeleDeMesure.categorie} />
  {#if modeleDeMesure.thematique}
    <CartoucheThematique thematique={modeleDeMesure.thematique} />
  {/if}
  <CartoucheIdentifiantMesure
    identifiant={modeleDeMesure.identifiantNumerique}
  />
</div>
<DescriptionLongueMesure
  description={modeleDeMesure.descriptionLongue}
  repliee={true}
/>

<style lang="scss">
  .description {
    font-size: 1rem;
    line-height: 1.5rem;
    color: #3a3a3a;
    font-weight: bold;
    margin-bottom: 8px;
    margin-top: 0;
  }

  .cartouches {
    display: flex;
    gap: 8px;
    margin-bottom: 30px;
  }
</style>
