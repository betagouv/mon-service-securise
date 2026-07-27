<script lang="ts">
  import { configurationAffichage } from '../mesure.store';
  import CartouchesMesure from '../../ui/CartouchesMesure.svelte';

  const {
    referentiel,
    indispensable,
    identifiantNumerique,
    categorie,
    thematique,
  } = $configurationAffichage;
</script>

<div class="entete-mesure">
  <CartouchesMesure
    {referentiel}
    {indispensable}
    {identifiantNumerique}
    {categorie}
    {thematique}
  />
</div>

<style lang="scss">
  .entete-mesure {
    margin-top: 1em;
  }
</style>
