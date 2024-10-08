<script lang="ts">
  import type {
    IdUtilisateur,
    Permission,
    Rubrique,
    Utilisateur,
  } from '../gestionContributeurs.d';
  import LigneContributeur from '../kit/LigneContributeur.svelte';
  import TagLectureEcriture from '../personnalisation/TagLectureEcriture.svelte';
  import { createEventDispatcher } from 'svelte';
  import OnOff from '../kit/OnOff.svelte';

  export let utilisateur: Utilisateur;
  export let droitsOriginaux: Record<Rubrique, Permission> & {
    estProprietaire: boolean;
  };
  $: redefinis = { ...droitsOriginaux };

  let rubriques: { id: Rubrique; nom: string; droit: Permission }[];
  $: rubriques = [
    { id: 'DECRIRE', nom: 'Décrire', droit: redefinis.DECRIRE },
    { id: 'SECURISER', nom: 'Sécuriser', droit: redefinis.SECURISER },
    { id: 'HOMOLOGUER', nom: 'Homologuer', droit: redefinis.HOMOLOGUER },
    { id: 'RISQUES', nom: 'Risques de sécurité', droit: redefinis.RISQUES },
    { id: 'CONTACTS', nom: 'Contacts utiles', droit: redefinis.CONTACTS },
  ];

  const dispatch = createEventDispatcher<{
    valider: Record<IdUtilisateur, Permission>;
    annuler: null;
  }>();
</script>

<div class="identite-contributeur">
  <div class="titre">Contributeur sélectionné</div>
  <ul class="liste-contributeurs">
    <LigneContributeur
      {utilisateur}
      droitsModifiables={false}
      afficheDroits={false}
    />
  </ul>
</div>
<div class="permissions">
  <div class="titre">Permissions</div>
  <div>Sélectionner les droits d'accès pour chaque rubrique.</div>
  <div class="personnalisation">
    {#each rubriques as { id, nom, droit }}
      <div class="rubrique">
        <div>
          <OnOff
            id="visibilite-{id}"
            checked={droit > 0}
            on:change={({ detail: estCochee }) => {
              if (estCochee) redefinis[id] = 1;
              else redefinis[id] = 0;
            }}
          />
          <div class="nom-rubrique">{nom}</div>
        </div>
        <div>
          {#if droit !== 0}
            <TagLectureEcriture
              {droit}
              on:droitChange={(e) => (redefinis[id] = e.detail)}
            />
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
    on:click={() => dispatch('annuler')}
  >
    Annuler
  </button>
  <button
    class="bouton"
    type="button"
    on:click={() => dispatch('valider', redefinis)}
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
    height: 1.7em;
  }
  .rubrique > div {
    display: flex;
    align-items: center;
    flex-direction: row;
    column-gap: 10px;
  }
  .rubrique .nom-rubrique {
    font-weight: 500;
    color: #08416a;
  }
</style>
