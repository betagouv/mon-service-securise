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
  }

  let {
    referentiel,
    indispensable,
    categorie,
    thematique,
    identifiantNumerique,
  }: Props = $props();
</script>

<div class="conteneur">
  {#if referentiel !== Referentiel.SPECIFIQUE}
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
