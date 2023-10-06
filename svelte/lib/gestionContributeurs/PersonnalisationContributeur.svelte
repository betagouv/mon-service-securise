<script lang="ts">
  import { store } from './gestionContributeurs.store';
  import LigneContributeur from './LigneContributeur.svelte';
  import TagLectureEcriture from './TagLectureEcriture.svelte';

  $: contributeur = $store.utilisateurEnCoursDePersonnalisation!;
  $: autorisations = $store.autorisations[contributeur.id];

  $: rubriques = [
    { nom: 'Décrire', droit: autorisations.droits.DECRIRE },
    { nom: 'Sécuriser', droit: autorisations.droits.SECURISER },
    { nom: 'Homologuer', droit: autorisations.droits.HOMOLOGUER },
    { nom: 'Risques de sécurité', droit: autorisations.droits.RISQUES },
    { nom: 'Contacts utiles', droit: autorisations.droits.CONTACTS },
  ];
</script>

<div class="identite-contributeur">
  <div class="titre">Contributeur sélectionné</div>
  <ul class="liste-contributeurs">
    <LigneContributeur
      utilisateur={contributeur}
      droitsModifiables={false}
      afficheDroits={false}
    />
  </ul>
</div>
<div class="permissions">
  <div class="titre">Permissions</div>
  <div>Sélectionner les droits d'accès pour chaque rubrique.</div>
  <div class="personnalisation">
    {#each rubriques as { nom, droit }}
      <div class="rubrique">
        <div class="nom-rubrique">{nom}</div>
        <div>
          {#if droit !== 0}
            <TagLectureEcriture {droit} />
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="conteneur-actions">
  <button
    class="bouton bouton-secondaire"
    type="button"
    on:click={() => store.navigation.afficheEtapeListe()}
  >
    Annuler
  </button>
  <button
    class="bouton"
    id="action-invitation"
    type="button"
    on:click={() => {}}
  >
    Enregistrer
  </button>
</div>

<style>
  .liste-contributeurs {
    list-style: none;
    padding-left: 0;
  }

  .liste-contributeurs :global(li) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 1em;
    margin-bottom: 0.5em;
  }

  .titre {
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .permissions {
    margin-top: 32px;
  }

  .personnalisation {
    margin: 16px 0 40px 0;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

  .rubrique {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .rubrique > div {
    display: flex;
    align-items: center;
    flex-direction: row;
  }
  .rubrique .nom-rubrique {
    font-weight: 500;
    color: #08416a;
  }
</style>
