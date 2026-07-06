<script lang="ts">
  import type { RisqueSpecifiqueV2 } from '../risquesV2.d';
  import CartouchesRisqueV2 from '../kit/CartouchesRisqueV2.svelte';
  import CartoucheIdentifiantRisqueSpecifiqueV2 from '../kit/CartoucheIdentifiantRisqueSpecifiqueV2.svelte';

  interface Props {
    risque?: RisqueSpecifiqueV2;
  }

  let { risque }: Props = $props();
</script>

<div>
  <CartoucheIdentifiantRisqueSpecifiqueV2 {risque} />
  {#if risque}
    <CartouchesRisqueV2 {risque} />
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }
</style>
