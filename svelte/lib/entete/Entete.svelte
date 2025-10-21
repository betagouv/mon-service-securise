<script lang="ts">
  import { onMount } from 'svelte';
  import { getUtilisateurCourant, type ProfilUtilisateur } from './entete.api';

  let connecte: ProfilUtilisateur | null;
  let menuVisible = false;

  onMount(async () => {
    connecte = await getUtilisateurCourant();
  });
</script>

{#if !connecte}
  <a href="/inscription" class="inscription">Inscription</a>
  <a href="/connexion" class="connexion">Connexion</a>
{:else}
  <button
    class="nom-utilisateur-courant"
    on:click={() => (menuVisible = !menuVisible)}
  >
    {connecte.utilisateur.prenomNom}
  </button>

  {#if menuVisible}
    <div class="menu">
      <a href="/tableauDeBord">Mon tableau de bord</a>
      <a href="/profil">Mettre à jour mon profil</a>
      {#if connecte.sourceAuthentification === 'MSS'}
        <a href="/motDePasse/edition">Changer mon mot de passe</a>
      {/if}
    </div>
  {/if}

  <a class="deconnexion" href="/deconnexion">Se déconnecter</a>
{/if}

<style>
  button {
    border: none;
    background: none;
    cursor: pointer;
  }

  .menu {
    width: 200px;
  }

  .deconnexion {
    flex-shrink: 0;
  }
</style>
