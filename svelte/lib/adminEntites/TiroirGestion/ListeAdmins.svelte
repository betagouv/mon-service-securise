<script lang="ts">
  import CartoucheAdmin from './CartoucheAdmin.svelte';
  import type { AdminSupervise } from '../adminEntites.types';

  interface Props {
    administrateurs: Array<AdminSupervise>;
  }

  let { administrateurs }: Props = $props();
</script>

<hr />
<h3>Administrateurs de l’entité</h3>
<span class="sous-titre"
  >Consultez la liste des utilisateurs disposant des droits admins.</span
>
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
  hr {
    border: none;
    border-top: 1px solid #dddddd;
  }
  h3 {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .sous-titre {
    font-size: 0.75rem;
    line-height: 1.125rem;
    color: #666666;
  }

  .conteneur-cartouches {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
