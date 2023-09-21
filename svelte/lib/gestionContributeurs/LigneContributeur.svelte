<script lang="ts">
  import type { Utilisateur } from './gestionContributeurs.d';
  import { store } from './gestionContributeurs.store';
  import MenuFlottant from '../ui/MenuFlottant.svelte';

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
    <MenuFlottant>
      <ul>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li
          class="action-suppression-contributeur"
          on:click={() => store.afficheEtapeSuppression(utilisateur)}
        >
          Retirer du service
        </li>
      </ul>
    </MenuFlottant>
  {/if}
</li>
