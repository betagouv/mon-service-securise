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

<style lang="scss">
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

  .nom-utilisateur-courant {
    display: flex;
    align-items: center;
    padding: 0.3em 0.85em;
    color: var(--systeme-design-etat-bleu);

    &:hover {
      background-color: var(--systeme-design-etat-gris-survol);
    }

    &:before {
      content: '';
      background-color: var(--systeme-design-etat-bleu);
      width: 1.3em;
      height: 1.1em;
      margin-right: 8px;
      -webkit-mask: url('/statique/assets/images/icone_utilisateur.svg')
        no-repeat center;
      mask: url('/statique/assets/images/icone_utilisateur.svg') no-repeat
        center;
      -webkit-mask-size: contain;
      mask-size: contain;
    }

    &:after {
      content: '';
      background-color: var(--systeme-design-etat-bleu);
      width: 0.7em;
      height: 0.7em;
      margin-left: 8px;
      -webkit-mask: url('/statique/assets/images/icone_fleche_bas.svg')
        no-repeat center;
      mask: url('/statique/assets/images/icone_fleche_bas.svg') no-repeat center;
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-position-y: 0.2em;
      mask-position-y: 0.2em;
    }

    @media screen and (max-width: 1247px) {
      padding: 0.3em 0 8px;
      border-bottom: 1px var(--liseres) solid;
      align-self: flex-start;
      width: 100%;

      & + .menu {
        position: unset;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        flex-direction: column;

        a {
          font-size: 1em;
          line-height: 2em;
          border: 0;
        }
      }
    }
  }
</style>
