<script lang="ts">
  import { questionsV2 } from '../../../../donneesReferentielMesuresV2';
  import { tick, createEventDispatcher } from 'svelte';
  import { type MiseAJour } from '../creationV2.api';
  import ListeChampTexte from './ListeChampTexte.svelte';
  import ChampOrganisation from '../../ui/ChampOrganisation.svelte';
  import type { DescriptionServiceV2 } from '../creationV2.types';

  export let donnees: DescriptionServiceV2;
  export let seulementNomServiceEditable: boolean;

  const dispatch = createEventDispatcher<{ champModifie: MiseAJour }>();

  const supprimeValeurPointAcces = (index: number) => {
    donnees.pointsAcces = donnees.pointsAcces.filter((_, i) => i !== index);
  };

  const ajouteValeurPointAcces = () => {
    donnees.pointsAcces = [...donnees.pointsAcces, ''];
  };

  const enregistrePointsAcces = async () => {
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
    await champModifie(
      'categoriesDonneesTraiteesSupplementaires',
      donnees.categoriesDonneesTraiteesSupplementaires.filter(
        (categoriesDonneesTraiteesSupplementaires) =>
          categoriesDonneesTraiteesSupplementaires.trim().length > 0
      )
    );
  };

  const champModifie = async (propriete: string, valeur: string | string[]) => {
    dispatch('champModifie', { [propriete]: valeur });
  };

  let elementHtml: HTMLElement & { errorMessage: string; status: string };
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
      errorMessage="Le nom du service est obligatoire."
      on:valuechanged={(e) => {
        donnees.nomService = e.detail;
        elementHtml.errorMessage = 'Le nom du service est obligatoire.';
        elementHtml.status =
          donnees.nomService.length < 1 ? 'error' : 'default';
      }}
      on:blur={async () => {
        if (donnees.nomService.length >= 1)
          await champModifie('nomService', donnees.nomService);
      }}
    />

    {#key donnees.siret}
      <ChampOrganisation
        siret={donnees.siret}
        on:siretChoisi={async (e) => {
          donnees.siret = e.detail;
          await champModifie('siret', e.detail);
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
      on:valuechanged={async (e) => {
        donnees.statutDeploiement = e.detail;
        await champModifie('statutDeploiement', donnees.statutDeploiement);
      }}
      placeholderDisabled
    />

    <dsfr-textarea
      label="Présentation du service*"
      type="text"
      id="presentation"
      rows={3}
      disabled={seulementNomServiceEditable}
      value={donnees.presentation}
      status={!seulementNomServiceEditable && donnees.presentation.length < 1
        ? 'error'
        : 'default'}
      errorMessage="La présentation du service est obligatoire."
      on:blur={async (e) => {
        donnees.presentation = e.target.value;
        if (donnees.presentation.length >= 1)
          await champModifie('presentation', donnees.presentation);
      }}
    />

    <div
      class="conteneur-liste-champs"
      class:inactif={seulementNomServiceEditable}
    >
      <label for="url-service">URL du service</label>
      <ListeChampTexte
        nomGroupe="pointsAcces"
        bind:valeurs={donnees.pointsAcces}
        on:ajout={ajouteValeurPointAcces}
        titreSuppression="Supprimer l'URL"
        titreAjout="Ajouter une URL"
        inactif={seulementNomServiceEditable}
        on:blur={() => enregistrePointsAcces()}
        on:suppression={async (e) => {
          supprimeValeurPointAcces(e.detail);
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
      on:valuechanged={async (e) => {
        donnees.typeService = e.detail;
        if (donnees.typeService.length >= 1) {
          await champModifie('typeService', donnees.typeService);
        }
      }}
      status={!seulementNomServiceEditable && donnees.typeService.length < 1
        ? 'error'
        : 'default'}
      errorMessage="Le type de service est obligatoire."
    />

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
      on:valuechanged={async (e) => {
        donnees.specificitesProjet = e.detail;
        if (donnees.specificitesProjet.length >= 1)
          await champModifie('specificitesProjet', donnees.specificitesProjet);
      }}
    />

    <dsfr-select
      label="Type de cloud / hébergement utilisé*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.typeHebergement).map(
        ([typeHebergement, { nom }]) => ({ value: typeHebergement, label: nom })
      )}
      value={donnees.typeHebergement}
      disabled={seulementNomServiceEditable}
      id="typeHebergement"
      on:valuechanged={async (e) => {
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
      }}
      placeholderDisabled
    />

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
      on:valuechanged={async (e) => {
        donnees.activitesExternalisees = e.detail;
        await champModifie(
          'activitesExternalisees',
          donnees.activitesExternalisees
        );
      }}
    />
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
      on:valuechanged={async (e) => {
        donnees.ouvertureSysteme = e.detail;
        await champModifie('ouvertureSysteme', donnees.ouvertureSysteme);
      }}
      placeholderDisabled
    />

    <dsfr-select
      label="Audience cible du service*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.audienceCible).map(
        ([audienceCible, { nom }]) => ({ value: audienceCible, label: nom })
      )}
      value={donnees.audienceCible}
      disabled={seulementNomServiceEditable}
      id="audienceCible"
      on:valuechanged={async (e) => {
        donnees.audienceCible = e.detail;
        await champModifie('audienceCible', donnees.audienceCible);
      }}
      placeholderDisabled
    />

    <dsfr-select
      label="Durée maximale acceptable de dysfonctionnement du système*"
      placeholder="Sélectionnez une valeur"
      options={Object.entries(questionsV2.dureeDysfonctionnementAcceptable).map(
        ([duree, { nom }]) => ({ value: duree, label: nom })
      )}
      value={donnees.dureeDysfonctionnementAcceptable}
      disabled={seulementNomServiceEditable}
      id="dureeDysfonctionnementAcceptable"
      on:valuechanged={async (e) => {
        donnees.dureeDysfonctionnementAcceptable = e.detail;
        await champModifie(
          'dureeDysfonctionnementAcceptable',
          donnees.dureeDysfonctionnementAcceptable
        );
      }}
      placeholderDisabled
    />

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
      on:valuechanged={async (e) => {
        donnees.categoriesDonneesTraitees = e.detail;
        await champModifie(
          'categoriesDonneesTraitees',
          donnees.categoriesDonneesTraitees
        );
      }}
    />

    <div
      class="conteneur-liste-champs"
      class:inactif={seulementNomServiceEditable}
    >
      <label for="url-service">Données traitées supplémentaires</label>
      <ListeChampTexte
        nomGroupe="categoriesDonneesTraiteesSupplementaires"
        bind:valeurs={donnees.categoriesDonneesTraiteesSupplementaires}
        on:ajout={ajouteCategoriesDonneesTraiteesSupplementaires}
        titreSuppression="Supprimer les données"
        titreAjout="Ajouter des données"
        inactif={seulementNomServiceEditable}
        on:blur={() => enregistreCategoriesDonneesTraiteesSupplementaires()}
        on:suppression={async (e) => {
          supprimeCategoriesDonneesTraiteesSupplementaires(e.detail);
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
      on:valuechanged={async (e) => {
        donnees.volumetrieDonneesTraitees = e.detail;
        await champModifie(
          'volumetrieDonneesTraitees',
          donnees.volumetrieDonneesTraitees
        );
      }}
      placeholderDisabled
    />

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
      on:valuechanged={async (e) => {
        donnees.localisationDonneesTraitees = e.detail;
        await champModifie(
          'localisationDonneesTraitees',
          donnees.localisationDonneesTraitees
        );
      }}
    />
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
</style>
