const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./adaptateurs/fabriqueAdaptateurJournalMSS');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesHomologationsServices = require('./depots/depotDonneesHomologationsServices');
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

  const depotHomologations = depotDonneesHomologationsServices.creeDepot({
    adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel,
  });

  const depotServices = depotDonneesServices.creeDepot({
    adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel,
  });

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurJournalMSS, adaptateurJWT, adaptateurPersistance, adaptateurUUID, depotHomologations,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance, adaptateurUUID, depotServices, depotUtilisateurs,
  });

  const {
    ajouteAvisExpertCyberAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteRolesResponsabilitesAHomologation,
    dupliqueHomologation,
    finaliseDossier,
    homologation,
    homologationExiste,
    homologations,
    enregistreDossierCourant,
    nouvelleHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
    supprimeHomologationsCreeesPar,
    toutesHomologations,
  } = depotHomologations;

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

  const ajouteContributeurAHomologation = depotAutorisations.ajouteContributeurAService;
  const {
    accesAutorise,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    supprimeContributeur,
    transfereAutorisations,
  } = depotAutorisations;

  return {
    accesAutorise,
    ajouteAvisExpertCyberAHomologation,
    ajouteContributeurAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteRolesResponsabilitesAHomologation,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    dupliqueHomologation,
    homologation,
    homologationExiste,
    homologations,
    enregistreDossierCourant,
    finaliseDossier,
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelleHomologation,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeContributeur,
    supprimeHomologation,
    supprimeHomologationsCreeesPar,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    tousUtilisateurs,
    toutesHomologations,
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
