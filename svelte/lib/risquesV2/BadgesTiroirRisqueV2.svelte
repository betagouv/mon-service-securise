<script lang="ts">
  import CartoucheIdentifiantRisque from './CartoucheIdentifiantRisque.svelte';
  import type { Risque } from './risquesV2.d';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();
</script>

<div>
  <CartoucheIdentifiantRisque {risque} />
</div>

<style lang="scss">
  div {
    margin-top: 16px;
  }
</style>
