<script lang="ts">
  import type { Risque } from './risquesV2.d';
  import BadgesTiroirRisqueV2 from './BadgesTiroirRisqueV2.svelte';
  import { untrack } from 'svelte';
  import ContenuTiroir from '../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../ui/Onglets.svelte';
  import { mappingNiveauGravite, mappingNiveauVraisemblance } from './kit';
  import ActionsTiroir from '../ui/tiroirs/ActionsTiroir.svelte';
  import Switch from '../ui/Switch.svelte';
  import { metsAJourRisque } from './risquesV2.api';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import { toasterStore } from '../ui/stores/toaster.store';

  interface Props {
    idService: string;
    risque: Risque;
    risqueBrut: Risque;
  }

  let { idService, risque, risqueBrut }: Props = $props();

  export const titre = untrack(() => risque.intitule);
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueV2;
  export const propsComposantEntete = untrack(() => ({ risque }));

  let ongletActif: 'infos' | 'mesuresAssociees' = $state('infos');

  let commentaire = $state(untrack(() => risque.commentaire));
  const metsAJourCommentaire = (e: CustomEvent<string>) => {
    commentaire = e.detail;
  };

  let actif = $state(untrack(() => !risque.desactive));

  const metsAJour = async () => {
    await metsAJourRisque(idService, risque.id, {
      desactive: !actif,
      commentaire,
    });
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
    toasterStore.succes('Succès', `Le risque ${risque.id} a été mis à jour.`);
    tiroirStore.ferme();
  };
</script>

<ContenuTiroir>
  <div class="conteneur-onglets">
    <Onglets
      bind:ongletActif
      onglets={[
        {
          id: 'infos',
          label: 'Information sur le risque',
        },
        {
          id: 'mesuresAssociees',
          label: 'Mesures associées',
        },
      ]}
    />
  </div>
  <div class="contenu-onglet">
    {#if ongletActif === 'infos'}
      <div>
        <p>
          <b>Description du risque</b>
          <span><i>Temporaire: Lorem Ipsum</i></span>
        </p>
        <p>
          <b>Exemple de service numérique</b>
          <span><i>Temporaire: Lorem Ipsum</i></span>
        </p>
        <div class="niveaux-risque">
          <div class="ligne-niveau-risque">
            <span><b>Gravité potentielle :</b></span>
            <span>{mappingNiveauGravite[risque.gravite]}</span>
          </div>
          <div class="ligne-niveau-risque">
            <span><b>Vraisemblance au départ :</b></span>
            <span>{mappingNiveauVraisemblance[risqueBrut.vraisemblance]}</span>
          </div>
        </div>
        <div>
          <label for="commentaire"><b>Commentaire</b></label>
          <dsfr-input
            type="text"
            id="commentaire"
            nom="commentaire"
            value={commentaire}
            placeholder="Apportez des précisions sur le risque"
            onvaluechanged={metsAJourCommentaire}
          ></dsfr-input>
        </div>
      </div>
    {:else if ongletActif === 'mesuresAssociees'}
      <p>Mesures</p>
    {/if}
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <div class="actions">
    <Switch bind:actif id="risque-tiroir-{risque.id}-actif" />
    <dsfr-button
      label="Enregistrer les modifications"
      kind="primary"
      size="md"
      has-icon
      icon="save-line"
      icon-place="left"
      onclick={metsAJour}
    ></dsfr-button>
  </div>
</ActionsTiroir>

<style lang="scss">
  .actions {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .contenu-onglet {
    padding: 32px;
    border: 1px solid #ddd;
    margin-top: -30px;
    border-top: none;

    label {
      margin-bottom: 8px;
      display: block;
    }

    & > div {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    p {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .niveaux-risque {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .ligne-niveau-risque {
        display: flex;

        & > * {
          flex: 1;
        }
      }
    }
  }

  .conteneur-onglets {
    border-bottom: 1px solid #ddd;
    padding-left: 16px;
  }
</style>
