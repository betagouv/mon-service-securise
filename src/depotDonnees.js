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

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    referentiel = Referentiel.creeReferentiel(),
    adaptateurRechercheEntite,
    busEvenements,
  } = config;

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurChiffrement,
    adaptateurJWT,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    busEvenements,
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

  const {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    metsAJourMesureGeneraleDuService,
    metsAJourMesuresSpecifiquesDuService,
    metsAJourService,
    nouveauService,
    rechercheContributeurs,
    remplaceRisquesSpecifiquesDuService,
    supprimeHomologation,
    tousLesServices,
  } = depotServices;

  const {
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelUtilisateur,
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
    ajouteContributeurAuService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    sauvegardeAutorisation,
    supprimeContributeur,
  } = depotAutorisations;

  const { lisParcoursUtilisateur, sauvegardeParcoursUtilisateur } =
    depotParcoursUtilisateurs;

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

  const { acquitteSuggestionAction } = depotSuggestionsActions;

  return {
    accesAutorise,
    acquitteSuggestionAction,
    ajouteContributeurAuService,
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    dupliqueService,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    finaliseDossierCourant,
    lisNotificationsExpirationHomologationEnDate,
    lisParcoursUtilisateur,
    marqueNouveauteLue,
    marqueTacheDeServiceLue,
    metsAJourMotDePasse,
    metsAJourMesureGeneraleDuService,
    metsAJourMesuresSpecifiquesDuService,
    metsAJourUtilisateur,
    metsAJourService,
    nouveauService,
    nouveautesPourUtilisateur,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    rechercheContributeurs,
    remplaceRisquesSpecifiquesDuService,
    sauvegardeAutorisation,
    sauvegardeParcoursUtilisateur,
    sauvegardeNotificationsExpirationHomologation,
    supprimeContributeur,
    supprimeHomologation,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeUtilisateur,
    tachesDesServices,
    tousUtilisateurs,
    tousLesServices,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
    verifieMotDePasse,
  };
};

module.exports = { creeDepot };
