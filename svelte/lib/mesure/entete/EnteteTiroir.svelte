<script lang="ts">
  import { Referentiel } from '../../ui/types.d';
  import { configurationAffichage } from '../mesure.store';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';
  import CartoucheIndispensable from '../../ui/CartoucheIndispensable.svelte';
  import CartoucheIdentifiantMesure from '../../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../../ui/CartoucheCategorieMesure.svelte';

  const { referentiel, indispensable, identifiantNumerique, categorie } =
    $configurationAffichage;
</script>

<div class="conteneur">
  <CartoucheReferentiel {referentiel} />
  {#if categorie}
    <CartoucheCategorieMesure {categorie} />
  {/if}
  {#if referentiel !== Referentiel.SPECIFIQUE}
    <CartoucheIndispensable indispensable={indispensable ?? false} />
  {/if}
  <CartoucheIdentifiantMesure identifiant={identifiantNumerique} />
</div>

<style>
  .conteneur {
    font-size: 0.6em;
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
</style>
