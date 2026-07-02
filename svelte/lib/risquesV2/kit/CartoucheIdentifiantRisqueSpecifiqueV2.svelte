<script lang="ts">
  import type { RisqueSpecifiqueV2 } from '../risquesV2';

  interface Props {
    risque?: RisqueSpecifiqueV2;
  }

  let { risque }: Props = $props();
</script>

<dsfr-badge
  label="Risque spécifique {risque ? `(${risque.identifiantNumerique})` : ''}"
  type="statut"
></dsfr-badge>

<style lang="scss">
  dsfr-badge {
    white-space: nowrap;
  }
</style>
