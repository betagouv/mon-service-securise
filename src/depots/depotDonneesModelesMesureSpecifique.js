const {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
  ErreurUtilisateurInexistant,
  ErreurDroitsInsuffisants,
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

    const tousExistent =
      await adaptateurPersistance.verifieTousLesServicesExistent(idsServices);
    if (!tousExistent) throw new ErreurServiceInexistant();

    const droitsSontSuffisants =
      await depotAutorisations.accesAutoriseAUneListeDeService(
        idUtilisateurAssociant,
        idsServices,
        { [SECURISER]: ECRITURE }
      );
    if (!droitsSontSuffisants) throw new ErreurDroitsInsuffisants();

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
