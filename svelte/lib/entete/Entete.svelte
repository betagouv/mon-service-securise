<script lang="ts">
  import { onMount } from 'svelte';
  import { getUtilisateurCourant, type ProfilUtilisateur } from './entete.api';

  let connecte: ProfilUtilisateur | null;

  onMount(async () => {
    connecte = await getUtilisateurCourant();
  });
</script>

{#if connecte}
  <span></span>
{:else}
  <a href="/inscription" class="inscription">Inscription</a>
  <a href="/connexion" class="connexion">Connexion</a>
{/if}
