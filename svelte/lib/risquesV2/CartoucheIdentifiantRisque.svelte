<script lang="ts">
  import type { Risque } from './risquesV2.d';
  import { couleur, mappingCouleursDSFR } from './kit';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();

  let label = $derived(`${risque.id.replace('R', 'Risque ')} (${risque.id})`);
  let laCouleur = $derived(couleur(risque.gravite, risque.vraisemblance));
</script>

<dsfr-badge {label} type="accent" accent={mappingCouleursDSFR[laCouleur]}
></dsfr-badge>

<style lang="scss">
  dsfr-badge {
    height: fit-content;
  }
</style>
