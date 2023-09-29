<script lang="ts">
  import type { ResumeNiveauDroit, Utilisateur } from './gestionContributeurs.d';
  import { store } from './gestionContributeurs.store';
  import MenuFlottant from '../ui/MenuFlottant.svelte';

  const STATUS_DROITS: Record<ResumeNiveauDroit, string> = {
    ECRITURE: 'Édition',
    LECTURE: 'Lecture',
    PERSONNALISE: 'Personnalisé',
  };

  export let estSupprimable: boolean;
  export let utilisateur: Utilisateur;
  export let resumeNiveauDroit: ResumeNiveauDroit;
</script>

<li class="ligne-contributeur">
  <div class="contenu-nom-prenom">
    <div
      class="initiales {resumeNiveauDroit}
    {!utilisateur.initiales ? 'persona' : ''}"
    >
      {utilisateur.initiales}
    </div>
    <div class="nom-prenom-poste">
      <div class="nom-contributeur">{@html utilisateur.prenomNom}</div>
      <div class="poste-contributeur">{@html utilisateur.poste}</div>
    </div>
  </div>
  {#if resumeNiveauDroit}
    <div class="role {resumeNiveauDroit}">
      {STATUS_DROITS[resumeNiveauDroit]}
    </div>
  {/if}
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

<style>
  .role,
  .initiales {
    background: linear-gradient(180deg, #54b8f6 0%, #3479c9 100%);
  }

  .ECRITURE {
    background: linear-gradient(180deg, #326fc0 0%, #4d3dc5 100%);
  }

  .LECTURE {
    background: linear-gradient(180deg, #a226b8 0%, #8926c9 100%);
  }

  .PERSONNALISE {
    background: linear-gradient(180deg, #54b8f6 0%, #3479c9 100%);
  }
</style>
