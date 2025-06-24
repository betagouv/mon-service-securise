<script lang="ts">
  import CartoucheIdentifiantMesure from '../../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../../ui/CartoucheCategorieMesure.svelte';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';
  import type { MesureReferentiel } from '../../ui/types.d';
  import DescriptionLongueMesure from '../../ui/DescriptionLongueMesure.svelte';

  export let mesure: MesureReferentiel;
</script>

<p class="description">{mesure.description}</p>
<div class="cartouches">
  <CartoucheReferentiel referentiel={mesure.referentiel} />
  <CartoucheCategorieMesure categorie={mesure.categorie} />
  <CartoucheIdentifiantMesure identifiant={mesure.identifiantNumerique} />
</div>
<DescriptionLongueMesure
  description={mesure.descriptionLongue}
  repliee={true}
/>

<style lang="scss">
  .description {
    font-size: 1rem;
    line-height: 1.5rem;
    color: #3a3a3a;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .cartouches {
    display: flex;
    gap: 8px;
    margin-bottom: 30px;
  }
</style>
