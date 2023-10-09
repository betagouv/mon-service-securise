<script lang="ts">
  import { store } from './gestionContributeurs.store';
  import type { Rubrique, Permission } from './gestionContributeurs.d';
  import LigneContributeur from './LigneContributeur.svelte';
  import TagLectureEcriture from './TagLectureEcriture.svelte';

  $: contributeur = $store.utilisateurEnCoursDePersonnalisation!;
  $: autorisation = $store.autorisations[contributeur.id];
  $: redefinis = { ...autorisation.droits };

  let rubriques: { id: Rubrique; nom: string; droit: Permission }[];
  $: rubriques = [
    { id: 'DECRIRE', nom: 'Décrire', droit: redefinis.DECRIRE },
    { id: 'SECURISER', nom: 'Sécuriser', droit: redefinis.SECURISER },
    { id: 'HOMOLOGUER', nom: 'Homologuer', droit: redefinis.HOMOLOGUER },
    { id: 'RISQUES', nom: 'Risques de sécurité', droit: redefinis.RISQUES },
    { id: 'CONTACTS', nom: 'Contacts utiles', droit: redefinis.CONTACTS },
  ];

  const envoyerDroits = async () => {
    const idService = $store.services[0].id;
    const idAutorisation = autorisation.idAutorisation;
    const { data: nouvelleAutorisation } = await axios.patch(
      `/api/service/${idService}/autorisations/${idAutorisation}`,
      { droits: redefinis }
    );
    store.autorisations.remplace(nouvelleAutorisation);
    store.navigation.afficheEtapeListe();
  };
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
    {#each rubriques as { id, nom, droit }}
      <div class="rubrique">
        <div class="nom-rubrique">{nom}</div>
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
    on:click={() => store.navigation.afficheEtapeListe()}
  >
    Annuler
  </button>
  <button
    class="bouton"
    id="action-invitation"
    type="button"
    on:click={() => envoyerDroits()}
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
