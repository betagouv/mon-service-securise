<script lang="ts">
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';
  import type { Risque } from '../risquesV2.d';
  import CartouchesRisqueV2 from '../kit/CartouchesRisqueV2.svelte';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();
</script>

<div>
  <CartoucheIdentifiantRisque {risque} />
  <CartouchesRisqueV2 {risque} />
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }
</style>
