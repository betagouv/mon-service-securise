<script lang="ts">
  import { configurationAffichage } from '../mesure.store';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';

  const { referentiel, indispensable } = $configurationAffichage;
</script>

<div class="conteneur">
  <CartoucheReferentiel {referentiel} {indispensable} />
</div>

<style>
  .conteneur {
    font-size: 0.6em;
    margin-bottom: 1em;
  }
</style>
