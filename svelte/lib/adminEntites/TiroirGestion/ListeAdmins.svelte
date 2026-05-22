<script lang="ts">
  import CartoucheAdmin from './CartoucheAdmin.svelte';
  import type { AdminSupervise } from '../adminEntites.types';

  interface Props {
    administrateurs: Array<AdminSupervise>;
  }

  let { administrateurs }: Props = $props();
</script>

<div class="conteneur-cartouches">
  {#each administrateurs as admin, i (i)}
    <CartoucheAdmin
      prenomNom={admin.prenomNom}
      initiales={admin.initiales}
      postes={admin.postes}
    />
  {/each}
</div>

<style>
  .conteneur-cartouches {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
