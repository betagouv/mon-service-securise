const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const { fabriqueAdaptateurUUID } = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesServices = require('./depots/depotDonneesServices');
const depotDonneesNotificationsExpirationHomologation = require('./depots/depotDonneesNotificationsExpirationHomologation');
const depotDonneesParcoursUtilisateurs = require('./depots/depotDonneesParcoursUtilisateur');
const depotDonneesUtilisateurs = require('./depots/depotDonneesUtilisateurs');
const depotDonneesNotifications = require('./depots/depotDonneesNotifications');
const depotDonneesSuggestionsActions = require('./depots/depotDonneesSuggestionsActions');
const depotDonneesActivitesMesure = require('./depots/depotDonneesActivitesMesure');
const depotDonneesEvolutionsIndiceCyber = require('./depots/depotDonneesEvolutionsIndiceCyber');
const depotDonneesSuperviseurs = require('./depots/depotDonneesSuperviseurs');
const depotDonneesParrainages = require('./depots/depotDonneesParrainages');
const depotDonneesSelsDeHachage = require('./depots/depotDonneesSelsDeHachage');
const depotDonneesTeleversementServices = require('./depots/depotDonneesTeleversementServices');
const depotDonneesModelesMesureSpecifique = require('./depots/depotDonneesModelesMesureSpecifique');

const {
  fabriqueAdaptateurChiffrement,
} = require('./adaptateurs/fabriqueAdaptateurChiffrement');
const {
  fabriqueAdaptateurProfilAnssi,
} = require('./adaptateurs/fabriqueAdaptateurProfilAnssi');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement = fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    referentiel = Referentiel.creeReferentiel(),
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

  const depotServices = depotDonneesServices.creeDepot({
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    depotDonneesUtilisateurs: depotUtilisateurs,
    busEvenements,
    referentiel,
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

  const depotSuggestionsActions = depotDonneesSuggestionsActions.creeDepot({
    adaptateurPersistance,
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
      referentiel,
    });

  const depotModelesMesureSpecifique =
    depotDonneesModelesMesureSpecifique.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      adaptateurUUID,
      depotAutorisations,
      depotServices,
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
    metsAJourRisqueSpecifiqueDuService,
    metsAJourService,
    nombreServices,
    nouveauService,
    rechercheContributeurs,
    supprimeService,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    tousLesServices,
    tousLesServicesAvecSiret,
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

  const { ajouteActiviteMesure, lisActivitesMesure } = depotActivitesMesure;

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
    ajouteModeleMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
    detacheModeleMesureSpecifiqueDesServices,
    lisModelesMesureSpecifiquePourUtilisateur,
  } = depotModelesMesureSpecifique;

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
    ajouteParrainage,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
    ajouteRolesResponsabilitesAService,
    ajouteSiretAuSuperviseur,
    ajouteSuggestionAction,
    associeModeleMesureSpecifiqueAuxServices,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    detacheModeleMesureSpecifiqueDesServices,
    dupliqueService,
    estSuperviseur,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    finaliseDossierCourant,
    lisActivitesMesure,
    lisDernierIndiceCyber,
    lisModelesMesureSpecifiquePourUtilisateur,
    lisNotificationsExpirationHomologationEnDate,
    lisParcoursUtilisateur,
    lisPourcentageProgressionTeleversementServices,
    lisSuperviseurs,
    lisTeleversementServices,
    marqueNouveauteLue,
    marqueTacheDeServiceLue,
    metsAJourMotDePasse,
    metsAJourMesureGeneraleDesServices,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourParrainage,
    metsAJourProgressionTeleversement,
    metsAJourRisqueSpecifiqueDuService,
    metsAJourUtilisateur,
    metsAJourService,
    nombreServices,
    nouveauService,
    nouveauTeleversementServices,
    nouveautesPourUtilisateur,
    nouvelUtilisateur,
    parrainagePour,
    rafraichisProfilUtilisateurLocal,
    reinitialiseMotDePasse,
    rechercheContributeurs,
    revoqueSuperviseur,
    santeDuDepot,
    sauvegardeAutorisation,
    sauvegardeParcoursUtilisateur,
    sauvegardeNouvelIndiceCyber,
    enregistreNouvelleConnexionUtilisateur,
    sauvegardeNotificationsExpirationHomologation,
    superviseur,
    supprimeContributeur,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    supprimeService,
    supprimeTeleversementServices,
    supprimeIdResetMotDePassePourUtilisateur,
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
  };
};

module.exports = { creeDepot };
