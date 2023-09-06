<script lang="ts">
  import type { Utilisateur } from './gestionContributeurs.d';

  export let estProprietaire: boolean;
  export let estSupprimable: boolean;
  export let utilisateur: Utilisateur;
  export let menuEstOuvert = false;

  export let onMenuClick = (idUtilisateur: string) => {};
  export let onRetirerContributeur = (utilisateur: Utilisateur) => {};
</script>

<li class="ligne-contributeur">
  <div class="contenu-nom-prenom">
    <div
      class="initiales {estProprietaire ? 'proprietaire' : 'contributeur'}
    {!utilisateur.initiales ? 'persona' : ''}"
    >
      {utilisateur.initiales}
    </div>
    <div class="nom-prenom-poste">
      <div class="nom-contributeur">{utilisateur.prenomNom}</div>
      <div class="poste-contributeur">{utilisateur.poste}</div>
    </div>
  </div>
  <div class="role {estProprietaire ? 'proprietaire' : 'contributeur'}">
    {estProprietaire ? 'Propriétaire' : 'Contributeur'}
  </div>
  {#if estSupprimable}
    <button
      class="declencheur-menu-flottant"
      on:click={() => onMenuClick(utilisateur.id)}
    >
      <div class="svelte-menu-flottant" class:invisible={!menuEstOuvert}>
        <ul>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="action-suppression-contributeur"
            on:click={() => onRetirerContributeur(utilisateur)}
          >
            Retirer du service
          </li>
        </ul>
      </div>
    </button>
  {/if}
</li>
