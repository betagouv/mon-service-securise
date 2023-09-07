<script lang="ts">
  import type { Utilisateur } from './gestionContributeurs.d';
  import { gestionContributeursStore } from './gestionContributeurs.store';

  export let estProprietaire: boolean;
  export let estSupprimable: boolean;
  export let utilisateur: Utilisateur;
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
      <div class="nom-contributeur">{@html utilisateur.prenomNom}</div>
      <div class="poste-contributeur">{@html utilisateur.poste}</div>
    </div>
  </div>
  <div class="role {estProprietaire ? 'proprietaire' : 'contributeur'}">
    {estProprietaire ? 'Propriétaire' : 'Contributeur'}
  </div>
  {#if estSupprimable}
    <button
      class="declencheur-menu-flottant"
      on:click={() => gestionContributeursStore.ouvrirMenuPour(utilisateur.id)}
    >
      <div
        class="svelte-menu-flottant"
        class:invisible={!(
          $gestionContributeursStore.idMenuOuvert === utilisateur.id
        )}
      >
        <ul>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="action-suppression-contributeur"
            on:click={() =>
              gestionContributeursStore.afficheEtapeSuppression(utilisateur)}
          >
            Retirer du service
          </li>
        </ul>
      </div>
    </button>
  {/if}
</li>
