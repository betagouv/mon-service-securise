<script lang="ts">
  import CartoucheAdmin from './CartoucheAdmin.svelte';
  import type { AdminSupervise } from '../adminEntites.types';

  interface Props {
    administrateurs: Array<AdminSupervise>;
    onsupprimer: (admin: AdminSupervise) => void;
  }

  let { administrateurs, onsupprimer }: Props = $props();
</script>

<div class="conteneur-cartouches">
  {#each administrateurs as admin, i (i)}
    <CartoucheAdmin
      prenomNom={admin.prenomNom}
      initiales={admin.initiales}
      postes={admin.postes}
      onsupprimer={() => onsupprimer(admin)}
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
