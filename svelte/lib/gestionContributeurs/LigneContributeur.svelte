<script lang="ts">
  import type {
    ResumeNiveauDroit,
    Utilisateur,
  } from './gestionContributeurs.d';
  import { store } from './gestionContributeurs.store';
  import Initiales from './Initiales.svelte';
  import TagNiveauDroit from './TagNiveauDroit.svelte';

  export let estSupprimable: boolean;
  export let utilisateur: Utilisateur;
  export let resumeNiveauDroit: ResumeNiveauDroit;
</script>

<li class="ligne-contributeur">
  <div class="contenu-nom-prenom">
    <Initiales valeur={utilisateur.initiales} {resumeNiveauDroit} />
    <div class="nom-prenom-poste">
      <div class="nom-contributeur">{@html utilisateur.prenomNom}</div>
      <div class="poste-contributeur">{@html utilisateur.poste}</div>
    </div>
  </div>
  <div class="conteneur-actions">
    <TagNiveauDroit niveau={resumeNiveauDroit} />
    {#if estSupprimable}
      <!--    svelte-ignore a11y-click-events-have-key-events-->
      <div
        class="conteneur-suppression"
        on:click={() => store.afficheEtapeSuppression(utilisateur)}
      >
        <img
          src="/statique/assets/images/icone_supprimer_gris.svg"
          alt="supression d'un contributeur"
          title="Supprimer ce contributeur"
        />
      </div>
    {/if}
  </div>
</li>

<style>
  .contenu-nom-prenom {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nom-contributeur {
    font-weight: 500;
    word-break: break-word;
  }
  .poste-contributeur {
    font-weight: 500;
    color: #667892;
  }

  .conteneur-suppression {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
  }
</style>
