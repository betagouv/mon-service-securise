<script lang="ts">
  import CartouchesMesure from '../../../ui/CartouchesMesure.svelte';
  import { CategorieMesure, Referentiel } from '../../../ui/types.d';

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

<div class="entete-mesure">
  <CartouchesMesure
    {referentiel}
    {indispensable}
    {identifiantNumerique}
    {categorie}
    {thematique}
    sansCartoucheIndispensable
  />
</div>

<style lang="scss">
  .entete-mesure {
    margin-top: 1em;
  }
</style>
