<script lang="ts">
  import CartoucheIndispensable from './CartoucheIndispensable.svelte';
  import { CategorieMesure, Referentiel } from './types.d';
  import CartoucheReferentiel from './CartoucheReferentiel.svelte';
  import CartoucheCategorieMesure from './CartoucheCategorieMesure.svelte';
  import CartoucheThematique from './CartoucheThematique.svelte';
  import CartoucheIdentifiantMesure from './CartoucheIdentifiantMesure.svelte';

  interface Props {
    referentiel: Referentiel;
    indispensable?: boolean;
    categorie?: CategorieMesure;
    thematique?: string;
    identifiantNumerique: string;
    sansCartoucheIndispensable?: boolean;
  }

  let {
    referentiel,
    indispensable,
    categorie,
    thematique,
    identifiantNumerique,
    sansCartoucheIndispensable = false,
  }: Props = $props();
</script>

<div class="conteneur">
  {#if referentiel !== Referentiel.SPECIFIQUE && !sansCartoucheIndispensable}
    <CartoucheIndispensable indispensable={indispensable ?? false} />
  {/if}
  <CartoucheReferentiel {referentiel} />
  {#if categorie}
    <CartoucheCategorieMesure {categorie} />
  {/if}
  {#if thematique}
    <CartoucheThematique {thematique} />
  {/if}
  <CartoucheIdentifiantMesure identifiant={identifiantNumerique} />
</div>

<style>
  .conteneur {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
