<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../../ui/Onglets.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import BadgesTiroirRisqueSpecifiqueV2 from './BadgesTiroirRisqueSpecifiqueV2.svelte';
  import type {
    DonneesRisqueSpecifiqueV2,
    Niveau,
    RisqueSpecifiqueV2,
  } from '../risquesV2.d';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../../risques/risques.d';
  import Infobulle from '../../ui/Infobulle.svelte';
  import {
    ajouteRisqueSpecifiqueV2,
    metsAJourRisqueSpecifiqueV2,
  } from '../risquesV2.api';
  import { untrack } from 'svelte';

  interface Props {
    idService: string;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
    risque?: RisqueSpecifiqueV2;
  }

  let {
    idService,
    niveauxGravite,
    niveauxVraisemblance,
    risque = undefined,
  }: Props = $props();

  export const titre = 'Ajouter un risque';
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueSpecifiqueV2;
  export const propsComposantEntete = {};

  let donneesRisque = $state(
    untrack(() => {
      if (risque) {
        const { id: _id, ...donnees } = risque;
        return donnees;
      }
      return undefined;
    }) ?? {
      intitule: '',
      description: '',
      categories: [],
      gravite: '',
      vraisemblance: '',
      graviteBrute: '',
      vraisemblanceBrute: '',
      commentaire: '',
    }
  ) as unknown as DonneesRisqueSpecifiqueV2;

  let estModification = $derived(!!risque);

  const metsAJourIntitule = (e: CustomEvent<string>) => {
    donneesRisque.intitule = e.detail;
  };

  const metsAJourDescription = (e: CustomEvent<string>) => {
    donneesRisque.description = e.detail;
  };

  const metsAJourCategories = (e: CustomEvent<string[]>) => {
    donneesRisque.categories = e.detail;
  };

  const metsAJourGraviteBrute = (e: CustomEvent<string>) => {
    donneesRisque.graviteBrute = parseInt(e.detail) as Niveau;
  };

  const metsAJourVraisemblanceBrute = (e: CustomEvent<string>) => {
    donneesRisque.vraisemblanceBrute = parseInt(e.detail) as Niveau;
  };

  const metsAJourGravite = (e: CustomEvent<string>) => {
    donneesRisque.gravite = parseInt(e.detail) as Niveau;
  };

  const metsAJourVraisemblance = (e: CustomEvent<string>) => {
    donneesRisque.vraisemblance = parseInt(e.detail) as Niveau;
  };

  const metsAJourCommentaire = (e: CustomEvent<string>) => {
    donneesRisque.commentaire = e.detail;
  };

  const ajouteOuModifieRisque = async () => {
    if (estModification) {
      await metsAJourRisqueSpecifiqueV2(idService, risque!.id, donneesRisque);
      toasterStore.succes(
        'Succès',
        `Le risque ${donneesRisque.intitule} a été mis à jour.`
      );
    } else {
      await ajouteRisqueSpecifiqueV2(idService, donneesRisque);
      toasterStore.succes(
        'Succès',
        `Le risque ${donneesRisque.intitule} a été ajouté.`
      );
    }
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
    tiroirStore.ferme();
  };
</script>

<ContenuTiroir>
  <div class="conteneur-onglets">
    <Onglets
      ongletActif="infos"
      onglets={[
        {
          id: 'infos',
          label: 'Information sur le risque',
        },
      ]}
    />
  </div>
  <div class="contenu-onglet">
    <div>
      <p>
        <dsfr-input
          label="Intitulé du risque"
          type="text"
          value={donneesRisque.intitule}
          onvaluechanged={metsAJourIntitule}
          required
        ></dsfr-input>
      </p>
      <p>
        <dsfr-textarea
          label="Description du risque"
          type="text"
          rows="5"
          value={donneesRisque.description}
          onvaluechanged={metsAJourDescription}
        ></dsfr-textarea>
      </p>
      <p>
        <lab-anssi-multi-select
          label="Catégories"
          options={[
            {
              id: 'disponibilite',
              value: 'disponibilite',
              label: 'Disponibilité',
            },
            { id: 'integrite', value: 'integrite', label: 'Intégrité' },
            {
              id: 'confidentialite',
              value: 'confidentialite',
              label: 'Confidentialité',
            },
            { id: 'tracabilite', value: 'tracabilite', label: 'Traçabilité' },
          ]}
          placeholder="Sélectionnez au moins une catégorie"
          values={donneesRisque.categories}
          onvaluechanged={metsAJourCategories}
          required
        ></lab-anssi-multi-select>
      </p>
      <div class="niveaux-risque">
        <span
          ><b>Risque brut</b><Infobulle
            contenu="Les risques bruts sont les risques évalués sans prendre en compte la mise en place des mesures de sécurité."
          /></span
        >
        <div class="ligne-niveau-risque">
          <dsfr-select
            label="Gravité potentielle"
            placeholder="Sélectionnez une valeur"
            options={Object.entries(niveauxGravite).map(
              ([, { description, position }]) => ({
                value: position,
                label: description,
              })
            )}
            value={donneesRisque.graviteBrute}
            onvaluechanged={metsAJourGraviteBrute}
            required
          ></dsfr-select>
          <dsfr-select
            label="Vraisemblance au départ"
            placeholder="Sélectionnez une valeur"
            options={Object.entries(niveauxVraisemblance).map(
              ([, { libelle, position }]) => ({
                value: position,
                label: libelle,
              })
            )}
            value={donneesRisque.vraisemblanceBrute}
            onvaluechanged={metsAJourVraisemblanceBrute}
            required
          ></dsfr-select>
        </div>
      </div>
      <div class="niveaux-risque">
        <span
          ><b>Risque résiduel</b><Infobulle
            contenu="Les risques résiduels actuels sont les risques évalués en prenant en compte les mesures de sécurité que vous avez déjà mises en place."
          /></span
        >
        <div class="ligne-niveau-risque">
          <dsfr-select
            label="Gravité résiduelle"
            placeholder="Sélectionnez une valeur"
            options={Object.entries(niveauxGravite).map(
              ([, { description, position }]) => ({
                value: position,
                label: description,
              })
            )}
            value={donneesRisque.gravite}
            onvaluechanged={metsAJourGravite}
            required
          ></dsfr-select>
          <dsfr-select
            label="Vraisemblance résiduelle"
            placeholder="Sélectionnez une valeur"
            options={Object.entries(niveauxVraisemblance).map(
              ([, { libelle, position }]) => ({
                value: position,
                label: libelle,
              })
            )}
            value={donneesRisque.vraisemblance}
            onvaluechanged={metsAJourVraisemblance}
            required
          ></dsfr-select>
        </div>
      </div>
      <div>
        <dsfr-input
          label="Commentaire"
          type="text"
          value={donneesRisque.commentaire}
          placeholder="Apportez des précisions sur le risque"
          onvaluechanged={metsAJourCommentaire}
        ></dsfr-input>
      </div>
    </div>
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <div class="actions">
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <dsfr-button
      label={estModification ? 'Enregistrer le risque' : 'Ajouter le risque'}
      kind="primary"
      size="md"
      has-icon
      icon={estModification ? 'save-line' : 'add-line'}
      icon-place="left"
      onclick={ajouteOuModifieRisque}
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

    dsfr-textarea,
    lab-anssi-multi-select {
      margin-bottom: -1.5rem;
    }

    .niveaux-risque {
      display: flex;
      flex-direction: column;
      gap: 8px;

      span {
        display: flex;
        gap: 0;
        align-items: center;
      }

      .ligne-niveau-risque {
        display: flex;
        gap: 24px;

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
