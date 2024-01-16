<script lang="ts">
  import { Referentiel } from '../../ui/types.d';
  import { configurationAffichage } from '../mesure.store';
  import CartoucheReferentiel from '../../ui/CartoucheReferentiel.svelte';
  import CartoucheIndispensable from '../../ui/CartoucheIndispensable.svelte';

  const { referentiel, indispensable } = $configurationAffichage;
</script>

<div class="conteneur">
  <CartoucheReferentiel {referentiel} />
  {#if referentiel !== Referentiel.SPECIFIQUE}
    <CartoucheIndispensable indispensable={indispensable ?? false} />
  {/if}
</div>

<style>
  .conteneur {
    font-size: 0.6em;
    margin-bottom: 1em;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
</style>
