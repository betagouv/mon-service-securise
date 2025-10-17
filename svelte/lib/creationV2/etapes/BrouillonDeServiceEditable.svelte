<script lang="ts">
  import { leBrouillon } from './brouillon.store';
  import { questionsV2 } from '../../../../donneesReferentielMesuresV2';
  import { tick, createEventDispatcher } from 'svelte';
  import { type MiseAJour } from '../creationV2.api';
  import ListeChampTexte from './ListeChampTexte.svelte';
  import ChampOrganisation from '../../ui/ChampOrganisation.svelte';

  const dispatch = createEventDispatcher<{ champModifie: MiseAJour }>();

  const supprimeValeurPointAcces = (index: number) => {
    $leBrouillon.pointsAcces = $leBrouillon.pointsAcces.filter(
      (_, i) => i !== index
    );
  };

  const ajouteValeurPointAcces = () => {
    $leBrouillon.pointsAcces = [...$leBrouillon.pointsAcces, ''];
  };

  const enregistrePointsAcces = async () => {
    await champModifie(
      'pointsAcces',
      $leBrouillon.pointsAcces.filter(
        (pointAcces) => pointAcces.trim().length > 0
      )
    );
  };

  const supprimeCategoriesDonneesTraiteesSupplementaires = (index: number) => {
    $leBrouillon.categoriesDonneesTraiteesSupplementaires =
      $leBrouillon.categoriesDonneesTraiteesSupplementaires.filter(
        (_, i) => i !== index
      );
  };

  const ajouteCategoriesDonneesTraiteesSupplementaires = () => {
    $leBrouillon.categoriesDonneesTraiteesSupplementaires = [
      ...$leBrouillon.categoriesDonneesTraiteesSupplementaires,
      '',
    ];
  };

  const enregistreCategoriesDonneesTraiteesSupplementaires = async () => {
    await champModifie(
      'categoriesDonneesTraiteesSupplementaires',
      $leBrouillon.categoriesDonneesTraiteesSupplementaires.filter(
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
  <h5>Informations génériques sur le projet</h5>

  <dsfr-input
    bind:this={elementHtml}
    label="Nom du service à sécuriser*"
    type="text"
    id="nom-service"
    nom="nom-service"
    value={$leBrouillon.nomService}
    errorMessage="Le nom du service est obligatoire."
    on:valuechanged={(e) => {
      $leBrouillon.nomService = e.detail;
      elementHtml.errorMessage = 'Le nom du service est obligatoire.';
      elementHtml.status =
        $leBrouillon.nomService.length < 1 ? 'error' : 'default';
    }}
    on:blur={async () => {
      if ($leBrouillon.nomService.length >= 1)
        await champModifie('nomService', $leBrouillon.nomService);
    }}
  />

  {#key $leBrouillon.siret}
    <ChampOrganisation
      siret={$leBrouillon.siret}
      on:siretChoisi={async (e) => await champModifie('siret', e.detail)}
      label="Organisation responsable du projet*"
      disabled={!$leBrouillon.id}
    />
  {/key}

  <dsfr-select
    label="Statut*"
    placeholder="Sélectionnez une valeur"
    options={Object.entries(questionsV2.statutDeploiement).map(
      ([statut, { description }]) => ({ value: statut, label: description })
    )}
    value={$leBrouillon.statutDeploiement}
    disabled={!$leBrouillon.id}
    id="statutDeploiement"
    on:valuechanged={async (e) => {
      $leBrouillon.statutDeploiement = e.detail;
      await champModifie('statutDeploiement', $leBrouillon.statutDeploiement);
    }}
    placeholderDisabled
  />

  <dsfr-textarea
    label="Présentation du service*"
    type="text"
    id="presentation"
    rows={3}
    disabled={!$leBrouillon.id}
    value={$leBrouillon.presentation}
    status={$leBrouillon.id && $leBrouillon.presentation.length < 1
      ? 'error'
      : 'default'}
    errorMessage="La présentation du service est obligatoire."
    on:blur={async (e) => {
      $leBrouillon.presentation = e.target.value;
      if ($leBrouillon.presentation.length >= 1) {
        await champModifie('presentation', $leBrouillon.presentation);
      }
    }}
  />

  <div class="conteneur-liste-champs" class:inactif={!$leBrouillon.id}>
    <label for="url-service">URL du service</label>
    <ListeChampTexte
      nomGroupe="pointsAcces"
      bind:valeurs={$leBrouillon.pointsAcces}
      on:ajout={ajouteValeurPointAcces}
      titreSuppression="Supprimer l'URL"
      titreAjout="Ajouter une URL"
      inactif={!$leBrouillon?.id}
      on:blur={() => enregistrePointsAcces()}
      on:suppression={async (e) => {
        supprimeValeurPointAcces(e.detail);
        await tick();
        await enregistrePointsAcces();
      }}
    />
  </div>
</div>

<div class="conteneur-avec-cadre">
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
    values={$leBrouillon.typeService}
    disabled={!$leBrouillon.id}
    id="typeService"
    on:valuechanged={async (e) => {
      $leBrouillon.typeService = e.detail;
      if ($leBrouillon.typeService.length >= 1) {
        await champModifie('typeService', $leBrouillon.typeService);
      }
    }}
    status={$leBrouillon.id && $leBrouillon.typeService.length < 1
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
    values={$leBrouillon.specificitesProjet}
    disabled={!$leBrouillon.id}
    id="specificitesProjet"
    on:valuechanged={async (e) => {
      $leBrouillon.specificitesProjet = e.detail;
      if ($leBrouillon.specificitesProjet.length >= 1) {
        await champModifie(
          'specificitesProjet',
          $leBrouillon.specificitesProjet
        );
      }
    }}
  />

  <dsfr-select
    label="Type de cloud / hébergement utilisé*"
    placeholder="Sélectionnez une valeur"
    options={Object.entries(questionsV2.typeHebergement).map(
      ([typeHebergement, { nom }]) => ({ value: typeHebergement, label: nom })
    )}
    value={$leBrouillon.typeHebergement}
    disabled={!$leBrouillon.id}
    id="typeHebergement"
    on:valuechanged={async (e) => {
      $leBrouillon.typeHebergement = e.detail;

      $leBrouillon.activitesExternalisees =
        $leBrouillon.typeHebergement === 'saas'
          ? ['administrationTechnique', 'developpementLogiciel']
          : [];

      await champModifie(
        'activitesExternalisees',
        $leBrouillon.activitesExternalisees
      );
      await champModifie('typeHebergement', $leBrouillon.typeHebergement);
    }}
    placeholderDisabled
  />

  <lab-anssi-multi-select
    label="Activités du projet entièrement externalisées"
    placeholder="Sélectionnez une ou plusieurs valeurs"
    disabled={!$leBrouillon.id || $leBrouillon.typeHebergement === 'saas'}
    options={Object.entries(questionsV2.activiteExternalisee).map(
      ([activiteExternalisee, { nom }]) => ({
        id: activiteExternalisee,
        value: activiteExternalisee,
        label: nom,
      })
    )}
    values={$leBrouillon.activitesExternalisees}
    id="activitesExternalisees"
    on:valuechanged={async (e) => {
      $leBrouillon.activitesExternalisees = e.detail;
      await champModifie(
        'activitesExternalisees',
        $leBrouillon.activitesExternalisees
      );
    }}
  />
</div>

<div class="conteneur-avec-cadre">
  <h5>Évaluation de la criticité et de l'exposition du service</h5>

  <dsfr-select
    label="Ouverture du système*"
    placeholder="Sélectionnez une valeur"
    options={Object.entries(questionsV2.ouvertureSysteme).map(
      ([ouvertureSysteme, { nom }]) => ({ value: ouvertureSysteme, label: nom })
    )}
    value={$leBrouillon.ouvertureSysteme}
    disabled={!$leBrouillon.id}
    id="ouvertureSysteme"
    on:valuechanged={async (e) => {
      $leBrouillon.ouvertureSysteme = e.detail;
      await champModifie('ouvertureSysteme', $leBrouillon.ouvertureSysteme);
    }}
    placeholderDisabled
  />

  <dsfr-select
    label="Audience cible du service*"
    placeholder="Sélectionnez une valeur"
    options={Object.entries(questionsV2.audienceCible).map(
      ([audienceCible, { nom }]) => ({ value: audienceCible, label: nom })
    )}
    value={$leBrouillon.audienceCible}
    disabled={!$leBrouillon.id}
    id="audienceCible"
    on:valuechanged={async (e) => {
      $leBrouillon.audienceCible = e.detail;
      await champModifie('audienceCible', $leBrouillon.audienceCible);
    }}
    placeholderDisabled
  />

  <dsfr-select
    label="Durée maximale acceptable de dysfonctionnement du système*"
    placeholder="Sélectionnez une valeur"
    options={Object.entries(questionsV2.dureeDysfonctionnementAcceptable).map(
      ([duree, { nom }]) => ({ value: duree, label: nom })
    )}
    value={$leBrouillon.dureeDysfonctionnementAcceptable}
    disabled={!$leBrouillon.id}
    id="dureeDysfonctionnementAcceptable"
    on:valuechanged={async (e) => {
      $leBrouillon.dureeDysfonctionnementAcceptable = e.detail;
      await champModifie(
        'dureeDysfonctionnementAcceptable',
        $leBrouillon.dureeDysfonctionnementAcceptable
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
    values={$leBrouillon.categoriesDonneesTraitees}
    disabled={!$leBrouillon.id}
    id="categoriesDonneesTraitees"
    on:valuechanged={async (e) => {
      $leBrouillon.categoriesDonneesTraitees = e.detail;
      await champModifie(
        'categoriesDonneesTraitees',
        $leBrouillon.categoriesDonneesTraitees
      );
    }}
  />
  <div class="conteneur-liste-champs" class:inactif={!$leBrouillon.id}>
    <label for="url-service">Données traitées supplémentaires</label>
    <ListeChampTexte
      nomGroupe="categoriesDonneesTraiteesSupplementaires"
      bind:valeurs={$leBrouillon.categoriesDonneesTraiteesSupplementaires}
      on:ajout={ajouteCategoriesDonneesTraiteesSupplementaires}
      titreSuppression="Supprimer les données"
      titreAjout="Ajouter des données"
      inactif={!$leBrouillon?.id}
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
    value={$leBrouillon.volumetrieDonneesTraitees}
    disabled={!$leBrouillon.id}
    id="volumetrieDonneesTraitees"
    on:valuechanged={async (e) => {
      $leBrouillon.volumetrieDonneesTraitees = e.detail;
      await champModifie(
        'volumetrieDonneesTraitees',
        $leBrouillon.volumetrieDonneesTraitees
      );
    }}
    placeholderDisabled
  />

  <lab-anssi-multi-select
    label="Localisation des données traitées*"
    placeholder="Sélectionnez une ou plusieurs valeurs"
    options={Object.entries(questionsV2.localisationDonneesTraitees).map(
      ([localisation, { nom }]) => ({
        id: localisation,
        value: localisation,
        label: nom,
      })
    )}
    values={$leBrouillon.localisationsDonneesTraitees}
    disabled={!$leBrouillon.id}
    status={$leBrouillon.id &&
    $leBrouillon.localisationsDonneesTraitees.length < 1
      ? 'error'
      : 'default'}
    errorMessage="La localisation des données est obligatoire."
    id="localisationsDonneesTraitees"
    on:valuechanged={async (e) => {
      $leBrouillon.localisationsDonneesTraitees = e.detail;
      if ($leBrouillon.localisationsDonneesTraitees.length >= 1) {
        await champModifie(
          'localisationsDonneesTraitees',
          $leBrouillon.localisationsDonneesTraitees
        );
      }
    }}
  />
</div>

<style lang="scss">
  .conteneur-avec-cadre {
    max-width: 924px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 16px;
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
