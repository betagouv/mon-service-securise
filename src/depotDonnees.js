import { fabriqueAdaptateurJWT } from './adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurUUID } from './adaptateurs/adaptateurUUID.js';
import fabriqueAdaptateurPersistance from './adaptateurs/fabriqueAdaptateurPersistance.js';
import * as Referentiel from './referentiel.js';
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

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement = fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
    adaptateurJWT = fabriqueAdaptateurJWT(),
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    referentiel = Referentiel.creeReferentiel(),
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
    adaptateurProfilAnssi: fabriqueAdaptateurProfilAnssi(),
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
  });

  const {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesureSpecifiqueAuService,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
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
    metsAJourService,
    migreServiceVersV2,
    nombreServices,
    nouveauService,
    rechercheContributeurs,
    supprimeService,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    tousLesServices,
    tousLesServicesAvecSiret,
    versionsServiceUtiliseesParUtilisateur,
  } = depotServices;

  const {
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelUtilisateur,
    rafraichisProfilUtilisateurLocal,
    reinitialiseMotDePasse,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    tousUtilisateurs,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
    verifieMotDePasse,
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
    superviseur,
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
  } = depotBrouillonsService;

  const {
    ajouteSimulationMigrationReferentielSiNecessaire,
    lisSimulationMigrationReferentiel,
    sauvegardeSimulationMigrationReferentiel,
    supprimeSimulationMigrationReferentiel,
  } = depotSimulationMigration;

  const { estJwtRevoque, revoqueJwt } = depotSession;

  return {
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
    metsAJourMotDePasse,
    metsAJourMesureGeneraleDesServices,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourMesuresSpecifiquesDesServices,
    metsAJourParrainage,
    metsAJourProgressionTeleversement,
    metsAJourRisqueSpecifiqueDuService,
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
    reinitialiseMotDePasse,
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
    superviseur,
    supprimeContributeur,
    supprimeDesMesuresAssocieesAuModele,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    supprimeService,
    supprimeSimulationMigrationReferentiel,
    supprimeTeleversementModelesMesureSpecifique,
    supprimeTeleversementServices,
    supprimeIdResetMotDePassePourUtilisateur,
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
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
    verifieLaCoherenceDesSels,
    verifieMotDePasse,
    versionsServiceUtiliseesParUtilisateur,
  };
};

export { creeDepot };
