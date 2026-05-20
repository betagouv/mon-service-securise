import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
import { fabriqueAdaptateurJWT } from './adaptateurs/adaptateurJWT.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from './adaptateurs/adaptateurUUID.js';
import fabriqueAdaptateurPersistance from './adaptateurs/fabriqueAdaptateurPersistance.js';
import * as depotDonneesAutorisations from './depots/depotDonneesAutorisations.js';
import * as depotDonneesServices from './depots/depotDonneesServices.js';
import * as depotDonneesNotificationsExpirationHomologation from './depots/depotDonneesNotificationsExpirationHomologation.js';
import * as depotDonneesParcoursUtilisateurs from './depots/depotDonneesParcoursUtilisateur.js';
import * as depotDonneesUtilisateurs from './depots/depotDonneesUtilisateurs.js';
import * as depotDonneesNotifications from './depots/depotDonneesNotifications.js';
import * as depotDonneesSuggestionsActions from './depots/depotDonneesSuggestionsActions.js';
import * as depotDonneesActivitesMesure from './depots/depotDonneesActivitesMesure.js';
import * as depotDonneesEvolutionsIndiceCyber from './depots/depotDonneesEvolutionsIndiceCyber.js';
import * as depotDonneesSuperviseurs from './depots/depotDonneesSuperviseurs.js';
import * as depotDonneesParrainages from './depots/depotDonneesParrainages.js';
import * as depotDonneesSelsDeHachage from './depots/depotDonneesSelsDeHachage.js';
import * as depotDonneesTeleversementServices from './depots/depotDonneesTeleversementServices.js';
import * as depotDonneesTeleversementModelesMesureSpecifique from './depots/depotDonneesTeleversementModelesMesureSpecifique.js';
import * as depotDonneesModelesMesureSpecifique from './depots/depotDonneesModelesMesureSpecifique.js';
import { fabriqueAdaptateurChiffrement } from './adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurProfilAnssi } from './adaptateurs/fabriqueAdaptateurProfilAnssi.js';
import * as depotDonneesBrouillonService from './depots/depotDonneesBrouillonService.js';
import * as depotSimulationMigrationReferentiel from './depots/depotDonneesSimulationMigrationReferentiel.js';
import * as depotDonneesSession from './depots/depotDonneesSession.js';
import { fabriqueAdaptateurPersistanceTS } from './adaptateurs/fabriqueAdaptateurPersistanceTS.js';
import { DepotDonneesAdminsOrganisations } from './depots/depotDonneesAdminsOrganisations.js';
import { DepotDonneesSuperviseursOO } from './depots/depotDonneesSuperviseursOO.js';
import { AdaptateurChiffrement } from './adaptateurs/adaptateurChiffrement.interface.js';
import { AdaptateurEnvironnement } from './adaptateurs/adaptateurEnvironnement.interface.js';
import { AdaptateurJWT } from './adaptateurs/adaptateurJWT.interface.js';
import { AdaptateurPersistance } from './adaptateurs/adaptateurPersistance.interface.js';
import { PersistanceTS } from './adaptateurs/persistanceTS.interface.js';
import { Referentiel, ReferentielV2 } from './referentiel.interface.js';
import { creeReferentiel } from './referentiel.js';
import { AdaptateurRechercheEntreprise } from './adaptateurs/adaptateurRechercheEntreprise.interface.js';
import BusEvenements from './bus/busEvenements.js';
import { ServiceCgu } from './serviceCgu.interface.js';

export type ConfigDepotDonnees = {
  adaptateurChiffrement?: AdaptateurChiffrement;
  adaptateurEnvironnement: AdaptateurEnvironnement;
  adaptateurJWT?: AdaptateurJWT;
  adaptateurPersistance?: AdaptateurPersistance;
  adaptateurPersistanceTS?: PersistanceTS;
  adaptateurProfilAnssi?: AdaptateurProfilAnssi;
  adaptateurUUID?: AdaptateurUUID;
  referentiel?: Referentiel;
  referentielV2: ReferentielV2;
  adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  busEvenements: BusEvenements;
  serviceCgu: ServiceCgu;
};

const creeDepot = (config: ConfigDepotDonnees) => {
  const {
    adaptateurChiffrement = fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
    adaptateurJWT = fabriqueAdaptateurJWT(),
    adaptateurPersistance = fabriqueAdaptateurPersistance(
      process.env.NODE_ENV
    ) as AdaptateurPersistance,
    adaptateurPersistanceTS = fabriqueAdaptateurPersistanceTS(
      process.env.NODE_ENV!,
      adaptateurChiffrement
    ),
    adaptateurProfilAnssi = fabriqueAdaptateurProfilAnssi(),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    referentiel = creeReferentiel(),
    referentielV2,
    adaptateurRechercheEntite,
    busEvenements,
    serviceCgu,
  } = config;

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurChiffrement,
    adaptateurEnvironnement,
    adaptateurJWT,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    adaptateurProfilAnssi,
    busEvenements,
    serviceCgu,
  });

  const depotSuggestionsActions = depotDonneesSuggestionsActions.creeDepot({
    adaptateurPersistance,
  });

  const depotServices = depotDonneesServices.creeDepot({
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    depotDonneesUtilisateurs: depotUtilisateurs,
    depotDonneesSuggestionsActions: depotSuggestionsActions,
    busEvenements,
    referentiel,
    referentielV2,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance,
    adaptateurUUID,
    depotServices,
    depotUtilisateurs,
    busEvenements,
  });

  const depotParcoursUtilisateurs = depotDonneesParcoursUtilisateurs.creeDepot({
    adaptateurPersistance,
    referentiel,
    busEvenements,
  });

  const depotNotificationsExpirationHomologation =
    depotDonneesNotificationsExpirationHomologation.creeDepot({
      adaptateurPersistance,
      adaptateurUUID,
    });

  const depotNotifications = depotDonneesNotifications.creeDepot({
    adaptateurPersistance,
    depotServices,
  });

  const depotActivitesMesure = depotDonneesActivitesMesure.creeDepot({
    adaptateurPersistance,
  });

  const depotEvolutionsIndiceCyber =
    depotDonneesEvolutionsIndiceCyber.creeDepot({
      adaptateurPersistance,
    });

  const depotSuperviseurs = depotDonneesSuperviseurs.creeDepot({
    adaptateurPersistance,
    adaptateurRechercheEntite,
    adaptateurChiffrement,
  });

  const depotParrainages = depotDonneesParrainages.creeDepot({
    adaptateurPersistance,
  });

  const depotSelsDeHachage = depotDonneesSelsDeHachage.creeDepot({
    adaptateurPersistance,
    adaptateurChiffrement,
    adaptateurEnvironnement,
  });

  const depotTeleversementServices =
    depotDonneesTeleversementServices.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      referentiel,
      referentielV2,
    });

  const depotModelesMesureSpecifique =
    depotDonneesModelesMesureSpecifique.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      adaptateurUUID,
      depotAutorisations,
      depotServices,
      referentiel,
    });

  const depotTeleversementModelesMesureSpecifique =
    depotDonneesTeleversementModelesMesureSpecifique.creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement,
      referentiel,
      depotModelesMesureSpecifique,
      busEvenements,
    });

  const depotBrouillonsService = depotDonneesBrouillonService.creeDepot({
    adaptateurChiffrement,
    persistance: adaptateurPersistance,
    adaptateurUUID,
    depotDonneesService: depotServices,
  });

  const depotSimulationMigration =
    depotSimulationMigrationReferentiel.creeDepot({
      persistance: adaptateurPersistance,
      adaptateurChiffrement,
      busEvenements,
    });

  const depotSession = depotDonneesSession.creeDepot({
    chiffrement: adaptateurChiffrement,
    persistance: adaptateurPersistance,
    decodeJwt: adaptateurJWT.decode as (jwt: string) => { exp: number },
  });

  const depotAdminsOrganisations = new DepotDonneesAdminsOrganisations({
    persistance: adaptateurPersistanceTS,
  });

  const depotSuperviseursOO = new DepotDonneesSuperviseursOO({
    persistance: adaptateurPersistanceTS,
  });

  const {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesureSpecifiqueAuService,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
    ajouteRisqueSpecifiqueV2,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    metsAJourMesureGeneraleDesServices,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourMesuresSpecifiquesDesServices,
    metsAJourRisqueSpecifiqueDuService,
    metsAJourRisqueSpecifiqueV2,
    metsAJourRisqueV2,
    metsAJourService,
    migreServiceVersV2,
    nombreServices,
    nouveauService,
    rechercheContributeurs,
    supprimeService,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    supprimeRisqueSpecifiqueV2,
    tousLesServices,
    tousLesServicesAvecSiret,
    versionsServiceUtiliseesParUtilisateur,
  } = depotServices;

  const {
    metsAJourUtilisateur,
    nouvelUtilisateur,
    rafraichisProfilUtilisateurLocal,
    supprimeUtilisateur,
    tousUtilisateurs,
    utilisateur,
    utilisateurExiste,
    utilisateurAvecEmail,
    utilisateursAdministresPar,
    utilisateursSupervisesPar,
    valideAcceptationCGUPourUtilisateur,
  } = depotUtilisateurs;

  const {
    accesAutorise,
    accesAutoriseAUneListeDeService,
    ajouteContributeurAuService,
    analyseDesProprietaires,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    sauvegardeAutorisation,
    supprimeAutorisationsAdminPour,
    supprimeContributeur,
  } = depotAutorisations;

  const {
    lisParcoursUtilisateur,
    marqueTableauDeBordVuDansParcoursUtilisateur,
    sauvegardeParcoursUtilisateur,
    enregistreNouvelleConnexionUtilisateur,
  } = depotParcoursUtilisateurs;

  const {
    marqueNouveauteLue,
    marqueTacheDeServiceLue,
    nouveautesPourUtilisateur,
    tachesDesServices,
  } = depotNotifications;

  const {
    lisNotificationsExpirationHomologationEnDate,
    sauvegardeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
  } = depotNotificationsExpirationHomologation;

  const {
    acquitteSuggestionAction,
    ajouteSuggestionAction,
    supprimeSuggestionsActionsPourService,
  } = depotSuggestionsActions;

  const {
    ajouteActiviteMesure,
    lisActivitesMesure,
    migreActivitesMesuresVersV2,
  } = depotActivitesMesure;

  const { lisDernierIndiceCyber, sauvegardeNouvelIndiceCyber } =
    depotEvolutionsIndiceCyber;

  const {
    ajouteSiretAuSuperviseur,
    estSuperviseur,
    lisSuperviseurs,
    revoqueSuperviseur,
  } = depotSuperviseurs;

  const { ajouteParrainage, parrainagePour, metsAJourParrainage } =
    depotParrainages;

  const { verifieLaCoherenceDesSels } = depotSelsDeHachage;

  const santeDuDepot = async () => {
    await adaptateurPersistance.sante();
  };

  const {
    lisPourcentageProgressionTeleversementServices,
    lisTeleversementServices,
    metsAJourProgressionTeleversement,
    nouveauTeleversementServices,
    supprimeTeleversementServices,
  } = depotTeleversementServices;

  const {
    confirmeTeleversementModelesMesureSpecifique,
    lisTeleversementModelesMesureSpecifique,
    nouveauTeleversementModelesMesureSpecifique,
    supprimeTeleversementModelesMesureSpecifique,
  } = depotTeleversementModelesMesureSpecifique;

  const {
    ajouteModeleMesureSpecifique,
    ajoutePlusieursModelesMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
    associeModelesMesureSpecifiqueAuService,
    dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService,
    lisModelesMesureSpecifiquePourUtilisateur,
    metsAJourModeleMesureSpecifique,
    nbRestantModelesMesureSpecifiquePourUtilisateur,
    supprimeDesMesuresAssocieesAuModele,
    supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees,
    supprimeModeleMesureSpecifiqueEtMesuresAssociees,
  } = depotModelesMesureSpecifique;

  const {
    nouveauBrouillonService,
    lisBrouillonService,
    lisBrouillonsService,
    finaliseBrouillonService,
    sauvegardeBrouillonService,
    supprimeBrouillonService,
  } = depotBrouillonsService;

  const {
    ajouteSimulationMigrationReferentielSiNecessaire,
    lisSimulationMigrationReferentiel,
    sauvegardeSimulationMigrationReferentiel,
    supprimeSimulationMigrationReferentiel,
  } = depotSimulationMigration;

  const { estJwtRevoque, revoqueJwt } = depotSession;

  const tousLesDepotsLegacy = {
    accesAutorise,
    accesAutoriseAUneListeDeService,
    acquitteSuggestionAction,
    ajouteActiviteMesure,
    ajouteContributeurAuService,
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesureSpecifiqueAuService,
    ajouteModeleMesureSpecifique,
    ajoutePlusieursModelesMesureSpecifique,
    ajouteParrainage,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
    ajouteRisqueSpecifiqueV2,
    ajouteRolesResponsabilitesAService,
    ajouteSimulationMigrationReferentielSiNecessaire,
    ajouteSiretAuSuperviseur,
    ajouteSuggestionAction,
    analyseDesProprietaires,
    associeModeleMesureSpecifiqueAuxServices,
    associeModelesMesureSpecifiqueAuService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    confirmeTeleversementModelesMesureSpecifique,
    dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService,
    dupliqueService,
    estJwtRevoque,
    estSuperviseur,
    finaliseBrouillonService,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    finaliseDossierCourant,
    lisActivitesMesure,
    lisBrouillonService,
    lisBrouillonsService,
    lisDernierIndiceCyber,
    lisModelesMesureSpecifiquePourUtilisateur,
    lisNotificationsExpirationHomologationEnDate,
    lisParcoursUtilisateur,
    lisPourcentageProgressionTeleversementServices,
    lisSimulationMigrationReferentiel,
    lisSuperviseurs,
    lisTeleversementModelesMesureSpecifique,
    lisTeleversementServices,
    marqueNouveauteLue,
    marqueTableauDeBordVuDansParcoursUtilisateur,
    marqueTacheDeServiceLue,
    metsAJourModeleMesureSpecifique,
    metsAJourMesureGeneraleDesServices,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourMesuresSpecifiquesDesServices,
    metsAJourParrainage,
    metsAJourProgressionTeleversement,
    metsAJourRisqueSpecifiqueDuService,
    metsAJourRisqueSpecifiqueV2,
    metsAJourRisqueV2,
    metsAJourUtilisateur,
    metsAJourService,
    migreActivitesMesuresVersV2,
    migreServiceVersV2,
    nbRestantModelesMesureSpecifiquePourUtilisateur,
    nombreServices,
    nouveauBrouillonService,
    nouveauService,
    nouveauTeleversementServices,
    nouveauTeleversementModelesMesureSpecifique,
    nouveautesPourUtilisateur,
    nouvelUtilisateur,
    parrainagePour,
    rafraichisProfilUtilisateurLocal,
    rechercheContributeurs,
    revoqueJwt,
    revoqueSuperviseur,
    santeDuDepot,
    sauvegardeAutorisation,
    sauvegardeBrouillonService,
    sauvegardeParcoursUtilisateur,
    sauvegardeNouvelIndiceCyber,
    enregistreNouvelleConnexionUtilisateur,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeSimulationMigrationReferentiel,
    supprimeAutorisationsAdminPour,
    supprimeBrouillonService,
    supprimeContributeur,
    supprimeDesMesuresAssocieesAuModele,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    supprimeRisqueSpecifiqueV2,
    supprimeService,
    supprimeSimulationMigrationReferentiel,
    supprimeTeleversementModelesMesureSpecifique,
    supprimeTeleversementServices,
    supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees,
    supprimeModeleMesureSpecifiqueEtMesuresAssociees,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeSuggestionsActionsPourService,
    supprimeUtilisateur,
    tachesDesServices,
    tousUtilisateurs,
    tousLesServices,
    tousLesServicesAvecSiret,
    utilisateur,
    utilisateurExiste,
    utilisateurAvecEmail,
    utilisateursAdministresPar,
    utilisateursSupervisesPar,
    valideAcceptationCGUPourUtilisateur,
    verifieLaCoherenceDesSels,
    versionsServiceUtiliseesParUtilisateur,
    lisSuperviseur:
      depotSuperviseursOO.lisSuperviseur.bind(depotSuperviseursOO),
    sauvegardeSuperviseur:
      depotSuperviseursOO.sauvegardeSuperviseur.bind(depotSuperviseursOO),
  };
  type TousLesDepotsLegacy = typeof tousLesDepotsLegacy;

  // le proxy sert d'aiguillage entre les dépôts en mode classe et les dépôts en mode procédural
  return new Proxy(depotAdminsOrganisations, {
    get(target, prop) {
      if (prop in target)
        return target[prop as keyof DepotDonneesAdminsOrganisations];
      const legacy =
        tousLesDepotsLegacy[prop as keyof typeof tousLesDepotsLegacy];
      return typeof legacy === 'function'
        ? legacy.bind(tousLesDepotsLegacy)
        : legacy;
    },
  }) as TousLesDepotsLegacy & DepotDonneesAdminsOrganisations;
};

export { creeDepot };
