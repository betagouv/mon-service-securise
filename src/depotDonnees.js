const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./adaptateurs/fabriqueAdaptateurJournalMSS');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesHomologations = require('./depots/depotDonneesHomologations');
const depotDonneesParcoursUtilisateurs = require('./depots/depotDonneesParcoursUtilisateur');
const depotDonneesUtilisateurs = require('./depots/depotDonneesUtilisateurs');

const creeDepot = (config = {}) => {
  const {
    adaptateurJournalMSS = fabriqueAdaptateurJournalMSS(),
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    referentiel = Referentiel.creeReferentiel(),
  } = config;

  const depotHomologations = depotDonneesHomologations.creeDepot({
    adaptateurJournalMSS,
    adaptateurPersistance,
    adaptateurUUID,
    referentiel,
  });

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurJournalMSS,
    adaptateurJWT,
    adaptateurPersistance,
    adaptateurUUID,
    depotHomologations,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance,
    adaptateurUUID,
    depotHomologations,
    depotUtilisateurs,
  });

  const depotParcoursUtilisateurs = depotDonneesParcoursUtilisateurs.creeDepot({
    adaptateurPersistance,
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
    nombreMoyenContributeursPourUtilisateur,
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

  const {
    accesAutorise,
    ajouteContributeurAHomologation,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    supprimeContributeur,
    transfereAutorisations,
  } = depotAutorisations;

  const { lisParcoursUtilisateur, sauvegardeParcoursUtilisateur } =
    depotParcoursUtilisateurs;

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
    lisParcoursUtilisateur,
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nombreMoyenContributeursPourUtilisateur,
    nouvelleHomologation,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceRisquesSpecifiquesPourHomologation,
    sauvegardeParcoursUtilisateur,
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
