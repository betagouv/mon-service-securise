<script lang="ts">
  import { questionsV2 } from '../../../../donneesReferentielMesuresV2';
  import { tick } from 'svelte';
  import type { MiseAJour } from '../creationV2.api';
  import ListeChampTexte from './ListeChampTexte.svelte';
  import ChampOrganisation from '../../ui/ChampOrganisation.svelte';
  import type {
    ActiviteExternalisee,
    AudienceCible,
    CategorieDonneesTraitees,
    DescriptionServiceV2,
    DureeDysfonctionnementAcceptable,
    LocalisationDonneesTraitees,
    OuvertureSysteme,
    SpecificiteProjet,
    StatutDeploiement,
    TypeHebergement,
    TypeService,
    VolumetrieDonneesTraitees,
  } from '../creationV2.types';

  interface Props {
    donnees: DescriptionServiceV2;
    seulementNomServiceEditable: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let {
    donnees = $bindable(),
    seulementNomServiceEditable,
    onChampModifie,
  }: Props = $props();

  const supprimeValeurPointAcces = (index: number) => {
    donnees.pointsAcces = donnees.pointsAcces.filter((_, i) => i !== index);
  };

  const ajouteValeurPointAcces = () => {
    donnees.pointsAcces = [...donnees.pointsAcces, ''];
  };

  const enregistrePointsAcces = async () => {
    if (
      donnees.pointsAcces.length > 0 &&
      donnees.pointsAcces.some((p) => p.length > 200)
    )
      return;
    await champModifie(
      'pointsAcces',
      donnees.pointsAcces.filter((pointAcces) => pointAcces.trim().length > 0)
    );
  };

  const supprimeCategoriesDonneesTraiteesSupplementaires = (index: number) => {
    donnees.categoriesDonneesTraiteesSupplementaires =
      donnees.categoriesDonneesTraiteesSupplementaires.filter(
        (_, i) => i !== index
      );
  };

  const ajouteCategoriesDonneesTraiteesSupplementaires = () => {
    donnees.categoriesDonneesTraiteesSupplementaires = [
      ...donnees.categoriesDonneesTraiteesSupplementaires,
      '',
    ];
  };

  const enregistreCategoriesDonneesTraiteesSupplementaires = async () => {
    if (
      donnees.categoriesDonneesTraiteesSupplementaires.length > 0 &&
      donnees.categoriesDonneesTraiteesSupplementaires.some(
        (c) => c.length > 200
      )
    )
      return;
    await champModifie(
      'categoriesDonneesTraiteesSupplementaires',
      donnees.categoriesDonneesTraiteesSupplementaires.filter(
        (categoriesDonneesTraiteesSupplementaires) =>
          categoriesDonneesTraiteesSupplementaires.trim().length > 0
      )
    );
  };

  const champModifie = async (propriete: string, valeur: string | string[]) => {
    onChampModifie({ [propriete]: valeur });
  };

  let elementHtml:
    | (HTMLElement & { errorMessage: string; status: string })
    | undefined = $state();

  type BlurEvent = FocusEvent & { target: HTMLInputElement };
  const metAJour = {
    localisationDonneesTraitees: async (
      e: CustomEvent<LocalisationDonneesTraitees | ''>
    ) => {
      donnees.localisationDonneesTraitees = e.detail;
      await champModifie(
        'localisationDonneesTraitees',
        donnees.localisationDonneesTraitees
      );
    },
    volumetrieDonneesTraitees: async (
      e: CustomEvent<VolumetrieDonneesTraitees | ''>
    ) => {
      donnees.volumetrieDonneesTraitees = e.detail;
      await champModifie(
        'volumetrieDonneesTraitees',
        donnees.volumetrieDonneesTraitees
      );
    },
    categoriesDonneesTraitees: async (
      e: CustomEvent<CategorieDonneesTraitees[]>
    ) => {
      donnees.categoriesDonneesTraitees = e.detail;
      await champModifie(
        'categoriesDonneesTraitees',
        donnees.categoriesDonneesTraitees
      );
    },
    dureeDysfonctionnementAcceptable: async (
      e: CustomEvent<DureeDysfonctionnementAcceptable | ''>
    ) => {
      donnees.dureeDysfonctionnementAcceptable = e.detail;
      await champModifie(
        'dureeDysfonctionnementAcceptable',
        donnees.dureeDysfonctionnementAcceptable
      );
    },
    audienceCible: async (e: CustomEvent<AudienceCible | ''>) => {
      donnees.audienceCible = e.detail;
      await champModifie('audienceCible', donnees.audienceCible);
    },
    ouvertureSysteme: async (e: CustomEvent<OuvertureSysteme | ''>) => {
      donnees.ouvertureSysteme = e.detail;
      await champModifie('ouvertureSysteme', donnees.ouvertureSysteme);
    },
    nomService: (e: CustomEvent<string>) => {
      if (!elementHtml) return;
      donnees.nomService = e.detail;
      if (donnees.nomService.length === 0 || donnees.nomService.length > 200) {
        elementHtml.errorMessage =
          'Le nom du service est obligatoire et ne doit pas dépasser 200 caractères';
        elementHtml.status = 'error';
      } else {
        elementHtml.errorMessage = '';
        elementHtml.status = 'info';
      }
    },
    statutDeploiement: async (e: CustomEvent<StatutDeploiement>) => {
      donnees.statutDeploiement = e.detail;
      await champModifie('statutDeploiement', donnees.statutDeploiement);
    },
    presentation: async (e: BlurEvent) => {
      donnees.presentation = e.target.value;
      if (
        donnees.presentation &&
        donnees.presentation.length >= 1 &&
        donnees.presentation.length <= 2000
      )
        await champModifie('presentation', donnees.presentation);
    },
    typeService: async (e: CustomEvent<TypeService[]>) => {
      donnees.typeService = e.detail;
      if (donnees.typeService.length >= 1) {
        await champModifie('typeService', donnees.typeService);
      }
    },
    specificitesProjet: async (e: CustomEvent<SpecificiteProjet[]>) => {
      donnees.specificitesProjet = e.detail;
      if (donnees.specificitesProjet.length >= 1)
        await champModifie('specificitesProjet', donnees.specificitesProjet);
    },
    typeHebergement: async (e: CustomEvent<TypeHebergement | ''>) => {
      donnees.typeHebergement = e.detail;

      donnees.activitesExternalisees =
        donnees.typeHebergement === 'saas'
          ? ['administrationTechnique', 'developpementLogiciel']
          : [];

      await champModifie(
        'activitesExternalisees',
        donnees.activitesExternalisees
      );
      await champModifie('typeHebergement', donnees.typeHebergement);
    },
    activitesExternalisees: async (e: CustomEvent<ActiviteExternalisee[]>) => {
      donnees.activitesExternalisees = e.detail;
      await champModifie(
        'activitesExternalisees',
        donnees.activitesExternalisees
      );
    },
  };
</script>

<div class="conteneur-avec-cadre">
  <div class="gabarit-des-inputs">
    <h5>Informations génériques sur le projet</h5>

    <dsfr-input
      bind:this={elementHtml}
      label="Nom du service à sécuriser*"
      type="text"
      id="nom-service"
      nom="nom-service"
      value={donnees.nomService}
      status="info"
      infoMessage="200 caractères maximum"
      onvaluechanged={metAJour.nomService}
      onblur={async () => {
        if (donnees.nomService.length >= 1 && donnees.nomService.length <= 200)
          await champModifie('nomService', donnees.nomService);
      }}
    ></dsfr-input>

    {#key donnees.siret}
      <ChampOrganisation
        siret={donnees.siret}
        onSiretChoisi={async (siret) => {
          donnees.siret = siret;
          await champModifie('siret', siret);
        }}
        label="Organisation responsable du projet*"
        disabled={seulementNomServiceEditable}
      />
    {/key}

    <dsfr-select
      label="Statut*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.statutDeploiement).map(
        ([statut, { description }]) => ({ value: statut, label: description })
      )}
      value={donnees.statutDeploiement}
      disabled={seulementNomServiceEditable}
      id="statutDeploiement"
      onvaluechanged={metAJour.statutDeploiement}
      placeholderDisabled
    ></dsfr-select>

    <dsfr-textarea
      label="Présentation du service"
      type="text"
      id="presentation"
      rows={3}
      disabled={seulementNomServiceEditable}
      value={donnees.presentation}
      status={donnees.presentation && donnees.presentation.length > 2000
        ? 'error'
        : 'info'}
      infoMessage={donnees.presentation && donnees.presentation.length > 2000
        ? ''
        : '2000 caractères maximum'}
      errorMessage={donnees.presentation && donnees.presentation.length > 2000
        ? 'La présentation ne doit pas dépasser 2000 caractères'
        : ''}
      onblur={metAJour.presentation}
    ></dsfr-textarea>

    <div
      class="conteneur-liste-champs"
      class:inactif={seulementNomServiceEditable}
      id="url-du-service"
    >
      <label for="url-service">URL du service</label>
      <ListeChampTexte
        nomGroupe="pointsAcces"
        bind:valeurs={donnees.pointsAcces}
        onAjout={ajouteValeurPointAcces}
        titreSuppression="Supprimer l'URL"
        titreAjout="Ajouter une URL"
        inactif={seulementNomServiceEditable}
        limiteTaille={200}
        onblur={() => enregistrePointsAcces()}
        onSuppression={async (index) => {
          supprimeValeurPointAcces(index);
          await tick();
          await enregistrePointsAcces();
        }}
      />
    </div>
  </div>
</div>

<div class="conteneur-avec-cadre">
  <div class="gabarit-des-inputs">
    <h5>Caractéristiques du service</h5>

    <lab-anssi-multi-select
      label="Type de service*"
      placeholder="Sélectionnez un ou plusieurs valeurs"
      options={Object.entries(questionsV2.typeDeService).map(
        ([typeService, { nom }]) => ({
          id: typeService,
          value: typeService,
          label: nom,
        })
      )}
      values={donnees.typeService}
      disabled={seulementNomServiceEditable}
      id="typeService"
      onvaluechanged={metAJour.typeService}
      status={!seulementNomServiceEditable && donnees.typeService.length < 1
        ? 'error'
        : 'default'}
      errorMessage="Le type de service est obligatoire."
    ></lab-anssi-multi-select>

    <div class="conteneur-marge-haute-negative">
      <lab-anssi-multi-select
        label="Spécificités à sécuriser"
        placeholder="Sélectionnez une ou plusieurs valeurs"
        options={Object.entries(questionsV2.specificiteProjet).map(
          ([specificiteProjet, { nom }]) => ({
            id: specificiteProjet,
            value: specificiteProjet,
            label: nom,
          })
        )}
        values={donnees.specificitesProjet}
        disabled={seulementNomServiceEditable}
        id="specificitesProjet"
        onvaluechanged={metAJour.specificitesProjet}
      ></lab-anssi-multi-select>
    </div>

    <div class="conteneur-marge-haute-negative">
      <dsfr-select
        label="Type de cloud / hébergement utilisé*"
        placeholder="Sélectionnez une valeur"
        options={Object.entries(questionsV2.typeHebergement).map(
          ([typeHebergement, { nom }]) => ({
            value: typeHebergement,
            label: nom,
          })
        )}
        value={donnees.typeHebergement}
        disabled={seulementNomServiceEditable}
        id="typeHebergement"
        onvaluechanged={metAJour.typeHebergement}
        placeholderDisabled
      ></dsfr-select>
    </div>

    <div class="conteneur-marge-basse-negative">
      <lab-anssi-multi-select
        label="Activités du projet entièrement externalisées"
        placeholder="Sélectionnez une ou plusieurs valeurs"
        disabled={seulementNomServiceEditable ||
          donnees.typeHebergement === 'saas'}
        options={Object.entries(questionsV2.activiteExternalisee).map(
          ([activiteExternalisee, { nom }]) => ({
            id: activiteExternalisee,
            value: activiteExternalisee,
            label: nom,
          })
        )}
        values={donnees.activitesExternalisees}
        id="activitesExternalisees"
        onvaluechanged={metAJour.activitesExternalisees}
      ></lab-anssi-multi-select>
    </div>
  </div>
</div>

<div class="conteneur-avec-cadre">
  <div class="gabarit-des-inputs">
    <h5>Évaluation de la criticité et de l'exposition du service</h5>

    <dsfr-select
      label="Ouverture du système*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.ouvertureSysteme).map(
        ([ouvertureSysteme, { nom }]) => ({
          value: ouvertureSysteme,
          label: nom,
        })
      )}
      value={donnees.ouvertureSysteme}
      disabled={seulementNomServiceEditable}
      id="ouvertureSysteme"
      onvaluechanged={metAJour.ouvertureSysteme}
      placeholderDisabled
    ></dsfr-select>

    <dsfr-select
      label="Audience cible du service*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.audienceCible).map(
        ([audienceCible, { nom }]) => ({ value: audienceCible, label: nom })
      )}
      value={donnees.audienceCible}
      disabled={seulementNomServiceEditable}
      id="audienceCible"
      onvaluechanged={metAJour.audienceCible}
      placeholderDisabled
    ></dsfr-select>

    <dsfr-select
      label="Durée maximale acceptable de dysfonctionnement du système*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.dureeDysfonctionnementAcceptable).map(
        ([duree, { nom }]) => ({ value: duree, label: nom })
      )}
      value={donnees.dureeDysfonctionnementAcceptable}
      disabled={seulementNomServiceEditable}
      id="dureeDysfonctionnementAcceptable"
      onvaluechanged={metAJour.dureeDysfonctionnementAcceptable}
      placeholderDisabled
    ></dsfr-select>

    <lab-anssi-multi-select
      label="Données traitées"
      placeholder="Sélectionnez une ou plusieurs valeurs"
      options={Object.entries(questionsV2.categorieDonneesTraitees).map(
        ([categorieDonneesTraitees, { nom }]) => ({
          id: categorieDonneesTraitees,
          value: categorieDonneesTraitees,
          label: nom,
        })
      )}
      values={donnees.categoriesDonneesTraitees}
      disabled={seulementNomServiceEditable}
      id="categoriesDonneesTraitees"
      onvaluechanged={metAJour.categoriesDonneesTraitees}
    ></lab-anssi-multi-select>

    <div
      class="conteneur-liste-champs conteneur-marge-haute-negative"
      class:inactif={seulementNomServiceEditable}
    >
      <label for="url-service">Données traitées supplémentaires</label>
      <ListeChampTexte
        nomGroupe="categoriesDonneesTraiteesSupplementaires"
        bind:valeurs={donnees.categoriesDonneesTraiteesSupplementaires}
        onAjout={ajouteCategoriesDonneesTraiteesSupplementaires}
        titreSuppression="Supprimer les données"
        titreAjout="Ajouter des données"
        inactif={seulementNomServiceEditable}
        limiteTaille={200}
        onblur={() => enregistreCategoriesDonneesTraiteesSupplementaires()}
        onSuppression={async (index) => {
          supprimeCategoriesDonneesTraiteesSupplementaires(index);
          await tick();
          await enregistreCategoriesDonneesTraiteesSupplementaires();
        }}
      />
    </div>

    <dsfr-select
      label="Volume des données traitées*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.volumetrieDonneesTraitees).map(
        ([volumetrie, { nom }]) => ({ value: volumetrie, label: nom })
      )}
      value={donnees.volumetrieDonneesTraitees}
      disabled={seulementNomServiceEditable}
      id="volumetrieDonneesTraitees"
      onvaluechanged={metAJour.volumetrieDonneesTraitees}
      placeholderDisabled
    ></dsfr-select>

    <dsfr-select
      label="Localisation des données traitées*"
      placeholder="Sélectionnez une ou plusieurs valeurs"
      placeholderDisabled
      options={Object.entries(questionsV2.localisationDonneesTraitees).map(
        ([localisation, { nom }]) => ({
          id: localisation,
          value: localisation,
          label: nom,
        })
      )}
      value={donnees.localisationDonneesTraitees}
      disabled={seulementNomServiceEditable}
      id="localisationDonneesTraitees"
      onvaluechanged={metAJour.localisationDonneesTraitees}
    ></dsfr-select>
  </div>
</div>

<style lang="scss">
  .gabarit-des-inputs {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 618px;
  }
  .conteneur-avec-cadre {
    max-width: 924px;
    border: 1px solid #ddd;
    padding: 24px;
    border-radius: 8px;
  }
  h5 {
    margin: 0;
    padding: 0;
    font-weight: 700;
    font-size: 1.375rem;
    line-height: 1.75;
  }
  label {
    font-size: 1rem;
    line-height: 1.5rem;
    color: #161616;
  }
  .conteneur-liste-champs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &.inactif label {
      color: #929292;
    }
  }

  #url-du-service,
  .conteneur-marge-haute-negative {
    margin-top: -1.5rem;
  }

  .conteneur-marge-basse-negative {
    margin-bottom: -1.5rem;
  }
</style>
