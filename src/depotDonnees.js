const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesHomologations = require('./depots/depotDonneesHomologations');
const depotDonneesUtilisateurs = require('./depots/depotDonneesUtilisateurs');

const creeDepot = (config = {}) => {
  const {
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    referentiel = Referentiel.creeReferentiel(),
  } = config;

  const depotHomologations = depotDonneesHomologations.creeDepot({
    adaptateurPersistance, adaptateurUUID, referentiel,
  });

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurJWT, adaptateurPersistance, adaptateurUUID, depotHomologations,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance, adaptateurUUID, depotHomologations, depotUtilisateurs,
  });

  const {
    ajouteAvisExpertCyberAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteMesureGeneraleAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteCartographieActeursAHomologation,
    homologation,
    homologationExiste,
    homologations,
    nouvelleHomologation,
    remplaceMesuresSpecifiquesPourHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
  } = depotHomologations;

  const {
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
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

  return {
    accesAutorise,
    ajouteAvisExpertCyberAHomologation,
    ajouteContributeurAHomologation,
    ajouteDescriptionServiceAHomologation,
    ajouteMesureGeneraleAHomologation,
    ajouteRisqueGeneralAHomologation,
    ajouteCartographieActeursAHomologation,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    homologation,
    homologationExiste,
    homologations,
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelleHomologation,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceMesuresSpecifiquesPourHomologation,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeContributeur,
    supprimeHomologation,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    transfereAutorisations,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
  };
};

const creeDepotVide = () => {
  const adaptateurPersistance = fabriqueAdaptateurPersistance();
  return adaptateurPersistance.supprimeUtilisateurs()
    .then(() => adaptateurPersistance.supprimeHomologations())
    .then(() => adaptateurPersistance.supprimeAutorisations())
    .then(() => creeDepot({ adaptateurPersistance }));
};

module.exports = { creeDepot, creeDepotVide };
