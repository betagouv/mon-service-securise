const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./adaptateurs/fabriqueAdaptateurJournalMSS');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesServices = require('./depots/depotDonneesServices');
const depotDonneesUtilisateurs = require('./depots/depotDonneesUtilisateurs');

const creeDepot = (config = {}) => {
  const {
    adaptateurJournalMSS = fabriqueAdaptateurJournalMSS(),
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    referentiel = Referentiel.creeReferentiel(),
  } = config;

  const depotServices = depotDonneesServices.creeDepot({
    adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel,
  });

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurJournalMSS, adaptateurJWT, adaptateurPersistance, adaptateurUUID,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance, adaptateurUUID, depotServices, depotUtilisateurs,
  });

  const {
    ajouteAvisExpertCyberAService,
    ajouteDescriptionServiceAService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossier,
    service,
    serviceExiste,
    services,
    enregistreDossierCourant,
    nouveauService,
    remplaceRisquesSpecifiquesPourService,
    supprimeService,
    supprimeServicesCreesPar,
    tousServices,
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
  } = depotUtilisateurs;

  const {
    accesAutorise,
    ajouteContributeurAService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    supprimeContributeur,
    transfereAutorisations,
  } = depotAutorisations;

  return {
    accesAutorise,
    ajouteAvisExpertCyberAService,
    ajouteContributeurAService,
    ajouteDescriptionServiceAService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    dupliqueService,
    enregistreDossierCourant,
    finaliseDossier,
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouveauService,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceRisquesSpecifiquesPourService,
    service,
    serviceExiste,
    services,
    supprimeContributeur,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeService,
    supprimeServicesCreesPar,
    supprimeUtilisateur,
    tousServices,
    tousUtilisateurs,
    transfereAutorisations,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
  };
};

module.exports = { creeDepot };
