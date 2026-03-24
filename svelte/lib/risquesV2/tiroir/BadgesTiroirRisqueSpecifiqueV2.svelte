<script lang="ts">
  import type { RisqueSpecifiqueV2 } from '../risquesV2.d';
  import CartouchesRisqueV2 from '../kit/CartouchesRisqueV2.svelte';

  interface Props {
    risque?: RisqueSpecifiqueV2;
  }

  let { risque }: Props = $props();
</script>

<div>
  <dsfr-badge label="Risque spécifique" type="statut"></dsfr-badge>
  {#if risque}
    <CartouchesRisqueV2 {risque} />
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;

    dsfr-badge {
      height: fit-content;
      white-space: nowrap;
    }
  }
</style>
