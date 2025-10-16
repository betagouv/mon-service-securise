<script lang="ts">
  import { entiteDeUtilisateur, leBrouillon } from './brouillon.store';
  import { questionsV2 } from '../../../../donneesReferentielMesuresV2';
  import { tick } from 'svelte';
  import {
    creeBrouillonService,
    metsAJourBrouillonService,
  } from '../creationV2.api';
  import ListeChampTexte from './ListeChampTexte.svelte';
  import { ajouteParametreAUrl } from '../../outils/url';
  import ChampOrganisation from '../../ui/ChampOrganisation.svelte';

  const supprimeValeurPointAcces = (index: number) => {
    $leBrouillon.pointsAcces = $leBrouillon.pointsAcces.filter(
      (_, i) => i !== index
    );
  };

  const ajouteValeurPointAcces = () => {
    $leBrouillon.pointsAcces = [...$leBrouillon.pointsAcces, ''];
  };

  const enregistrePointsAcces = async () => {
    await enregistre(
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
    await enregistre(
      'categoriesDonneesTraiteesSupplementaires',
      $leBrouillon.categoriesDonneesTraiteesSupplementaires.filter(
        (categoriesDonneesTraiteesSupplementaires) =>
          categoriesDonneesTraiteesSupplementaires.trim().length > 0
      )
    );
  };

  const enregistre = async (propriete: string, valeur: string | string[]) => {
    await metsAJourBrouillonService($leBrouillon.id, {
      [propriete]: valeur,
    });
  };
  let elementHtml: HTMLElement & { errorMessage: string; status: string };

  let siret: string;
  if ($leBrouillon.siret) {
    siret = $leBrouillon.siret;
  }

  $: {
    if (siret) {
      $leBrouillon.siret = siret;
      if (/^\d{14}$/.test(siret)) {
        enregistre('siret', siret);
      }
    }
  }
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
    on:blur={async (e) => {
      if ($leBrouillon.id && $leBrouillon.nomService.length >= 1) {
        return enregistre('nomService', $leBrouillon.nomService);
      }
      if (!$leBrouillon.id && $leBrouillon.nomService.length > 1) {
        const idBrouillon = await creeBrouillonService($leBrouillon.nomService);
        ajouteParametreAUrl('id', idBrouillon);
        leBrouillon.chargeDonnees({
          id: idBrouillon,
          nomService: $leBrouillon.nomService,
        });
        if ($entiteDeUtilisateur) {
          siret = $entiteDeUtilisateur.siret;
        }
      }
    }}
  />

  {#key siret}
    <ChampOrganisation
      bind:siret
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
    on:valuechanged={(e) => {
      $leBrouillon.statutDeploiement = e.detail;
      return enregistre('statutDeploiement', $leBrouillon.statutDeploiement);
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
    on:blur={(e) => {
      $leBrouillon.presentation = e.target.value;
      if ($leBrouillon.presentation.length >= 1) {
        return enregistre('presentation', $leBrouillon.presentation);
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
    on:valuechanged={(e) => {
      $leBrouillon.typeService = e.detail;
      if ($leBrouillon.typeService.length >= 1) {
        return enregistre('typeService', $leBrouillon.typeService);
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
    on:valuechanged={(e) => {
      $leBrouillon.specificitesProjet = e.detail;
      if ($leBrouillon.specificitesProjet.length >= 1) {
        return enregistre(
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

      await enregistre(
        'activitesExternalisees',
        $leBrouillon.activitesExternalisees
      );
      await enregistre('typeHebergement', $leBrouillon.typeHebergement);
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
    on:valuechanged={(e) => {
      $leBrouillon.activitesExternalisees = e.detail;
      return enregistre(
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
    on:valuechanged={(e) => {
      $leBrouillon.ouvertureSysteme = e.detail;
      return enregistre('ouvertureSysteme', $leBrouillon.ouvertureSysteme);
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
    on:valuechanged={(e) => {
      $leBrouillon.audienceCible = e.detail;
      return enregistre('audienceCible', $leBrouillon.audienceCible);
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
    on:valuechanged={(e) => {
      $leBrouillon.dureeDysfonctionnementAcceptable = e.detail;
      return enregistre(
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
    on:valuechanged={(e) => {
      $leBrouillon.categoriesDonneesTraitees = e.detail;
      return enregistre(
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
    on:valuechanged={(e) => {
      $leBrouillon.volumetrieDonneesTraitees = e.detail;
      return enregistre(
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
    on:valuechanged={(e) => {
      $leBrouillon.localisationsDonneesTraitees = e.detail;
      if ($leBrouillon.localisationsDonneesTraitees.length >= 1) {
        return enregistre(
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
