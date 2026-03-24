<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../../ui/Onglets.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import BadgesTiroirRisqueSpecifiqueV2 from './BadgesTiroirRisqueSpecifiqueV2.svelte';
  import type { RisqueSpecifiqueV2 } from '../risquesV2.d';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../../risques/risques.d';
  import Infobulle from '../../ui/Infobulle.svelte';
  import { ajouteRisqueSpecifiqueV2 } from '../risquesV2.api';

  interface Props {
    idService: string;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
  }

  let { idService, niveauxGravite, niveauxVraisemblance }: Props = $props();

  export const titre = 'Ajouter un risque';
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueSpecifiqueV2;
  export const propsComposantEntete = {};

  let risqueAjoute = $state({
    intitule: '',
    description: '',
    categories: [],
    gravite: '',
    vraisemblance: '',
    graviteBrute: '',
    vraisemblanceBrute: '',
    commentaire: '',
  }) as unknown as RisqueSpecifiqueV2;

  const metsAJourIntitule = (e: CustomEvent<string>) => {
    risqueAjoute.intitule = e.detail;
  };

  const metsAJourDescription = (e: CustomEvent<string>) => {
    risqueAjoute.description = e.detail;
  };

  const metsAJourCategories = (e: CustomEvent<string[]>) => {
    risqueAjoute.categories = e.detail;
  };

  const metsAJourGraviteBrute = (e: CustomEvent<string>) => {
    risqueAjoute.graviteBrute = parseInt(e.detail);
  };

  const metsAJourVraisemblanceBrute = (e: CustomEvent<string>) => {
    risqueAjoute.vraisemblanceBrute = parseInt(e.detail);
  };

  const metsAJourGravite = (e: CustomEvent<string>) => {
    risqueAjoute.gravite = parseInt(e.detail);
  };

  const metsAJourVraisemblance = (e: CustomEvent<string>) => {
    risqueAjoute.vraisemblance = parseInt(e.detail);
  };

  const metsAJourCommentaire = (e: CustomEvent<string>) => {
    risqueAjoute.commentaire = e.detail;
  };

  const ajouteRisque = async () => {
    await ajouteRisqueSpecifiqueV2(idService, risqueAjoute);
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
    toasterStore.succes(
      'Succès',
      `Le risque ${risqueAjoute.intitule} a été ajouté.`
    );
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
          value={risqueAjoute.intitule}
          onvaluechanged={metsAJourIntitule}
          required
        ></dsfr-input>
      </p>
      <p>
        <dsfr-textarea
          label="Description du risque"
          type="text"
          rows="5"
          value={risqueAjoute.description}
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
          values={risqueAjoute.categories}
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
            value={risqueAjoute.graviteBrute}
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
            value={risqueAjoute.vraisemblanceBrute}
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
            value={risqueAjoute.gravite}
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
            value={risqueAjoute.vraisemblance}
            onvaluechanged={metsAJourVraisemblance}
            required
          ></dsfr-select>
        </div>
      </div>
      <div>
        <dsfr-input
          label="Commentaire"
          type="text"
          value={risqueAjoute.commentaire}
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
      label="Ajouter le risque"
      kind="primary"
      size="md"
      has-icon
      icon="add-line"
      icon-place="left"
      onclick={ajouteRisque}
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
