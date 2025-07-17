const {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
  ErreurUtilisateurInexistant,
  ErreurDroitsInsuffisants,
  ErreurAutorisationInexistante,
} = require('../erreurs');
const {
  Permissions,
  Rubriques,
} = require('../modeles/autorisations/gestionDroits');

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    depotAutorisations,
    depotServices,
  } = config;

  const ajouteModeleMesureSpecifique = async (idUtilisateur, donnees) => {
    const utilisateur = await adaptateurPersistance.utilisateur(idUtilisateur);
    if (!utilisateur) throw new ErreurUtilisateurInexistant();

    const idModele = adaptateurUUID.genereUUID();
    const donneesChiffrees = await adaptateurChiffrement.chiffre(donnees);

    await adaptateurPersistance.ajouteModeleMesureSpecifique(
      idModele,
      idUtilisateur,
      donneesChiffrees
    );
  };

  const associeModeleMesureSpecifiqueAuxServices = async (
    idModele,
    idsServices,
    idUtilisateurAssociant
  ) => {
    const modeleExiste =
      await adaptateurPersistance.verifieModeleMesureSpecifiqueExiste(idModele);
    if (!modeleExiste)
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable(idModele);

    const possedeLeModele =
      await adaptateurPersistance.modeleMesureSpecifiqueAppartientA(
        idUtilisateurAssociant,
        idModele
      );
    if (!possedeLeModele)
      throw new ErreurAutorisationInexistante(
        `L'utilisateur ${idUtilisateurAssociant} n'est pas propriétaire du modèle ${idModele} qu'il veut associer`
      );

    const tousServicesExistent =
      await adaptateurPersistance.verifieTousLesServicesExistent(idsServices);
    if (!tousServicesExistent) throw new ErreurServiceInexistant();

    const droitsRequis = { [SECURISER]: ECRITURE };
    const droitsSontSuffisants =
      await depotAutorisations.accesAutoriseAUneListeDeService(
        idUtilisateurAssociant,
        idsServices,
        droitsRequis
      );
    if (!droitsSontSuffisants)
      throw new ErreurDroitsInsuffisants(
        idUtilisateurAssociant,
        idsServices,
        droitsRequis
      );

    const mutationDesServices = idsServices.map(async (unId) => {
      const s = await depotServices.service(unId);
      const idNouvelleMesure = adaptateurUUID.genereUUID();
      s.associeMesureSpecifiqueAuModele(idModele, idNouvelleMesure);
      return s;
    });
    const aPersister = await Promise.all(mutationDesServices);

    await Promise.all(aPersister.map(depotServices.metsAJourService));

    await adaptateurPersistance.associeModeleMesureSpecifiqueAuxServices(
      idModele,
      idsServices
    );
  };

  return {
    ajouteModeleMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
  };
};
module.exports = { creeDepot };
