<script lang="ts">
  import type { Droits, Permission, Rubrique } from '../gestionContributeurs.d';
  import LigneContributeur from '../kit/LigneContributeur.svelte';
  import TagLectureEcriture from '../personnalisation/TagLectureEcriture.svelte';
  import OnOff from '../kit/OnOff.svelte';
  import type { Contributeur } from '../kit/ChampAvecSuggestions.svelte';

  interface Props {
    utilisateur: Contributeur;
    droitsOriginaux: Droits;
    onValider: (droits: Droits) => void;
    onAnnuler: () => void;
  }

  let { utilisateur, droitsOriginaux, onValider, onAnnuler }: Props = $props();
  let redefinis = $derived({ ...droitsOriginaux });

  let rubriques: { id: Rubrique; nom: string; droit: Permission }[] = $derived([
    {
      id: 'DECRIRE',
      nom: 'Récapitulatif du service',
      droit: redefinis.DECRIRE,
    },
    { id: 'SECURISER', nom: 'Sécuriser', droit: redefinis.SECURISER },
    { id: 'HOMOLOGUER', nom: 'Homologuer', droit: redefinis.HOMOLOGUER },
    { id: 'RISQUES', nom: 'Risques de sécurité', droit: redefinis.RISQUES },
    { id: 'CONTACTS', nom: 'Contacts utiles', droit: redefinis.CONTACTS },
  ]);
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
    {#each rubriques as { id, nom, droit }, i (i)}
      <div class="rubrique">
        <div>
          <OnOff
            id="visibilite-{id}"
            checked={droit > 0}
            onChange={(estCochee) => {
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
              onDroitChange={(droit) => (redefinis[id] = droit)}
            />
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="conteneur-actions">
  <button class="bouton bouton-secondaire" type="button" onclick={onAnnuler}>
    Annuler
  </button>
  <button class="bouton" type="button" onclick={() => onValider(redefinis)}>
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
