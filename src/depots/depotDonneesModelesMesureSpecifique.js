const {
  ErreurUtilisateurInexistant,
  ErreurServiceNonAssocieAuModele,
} = require('../erreurs');
const {
  VerificationsAssocieOuDetache,
} = require('./modelesMesureSpecifique/VerificationsAssocieOuDetache');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    depotAutorisations,
    depotServices,
  } = config;

  const verificationsAssocieOuDetache = new VerificationsAssocieOuDetache({
    adaptateurPersistance,
    depotAutorisations,
  });

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
    await verificationsAssocieOuDetache.toutes(
      idModele,
      idsServices,
      idUtilisateurAssociant
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

  const detacheModeleMesureSpecifiqueDesServices = async (
    idModele,
    idsServices,
    idUtilisateurDetachant
  ) => {
    await verificationsAssocieOuDetache.toutes(
      idModele,
      idsServices,
      idUtilisateurDetachant
    );

    const tousAssocies =
      await adaptateurPersistance.tousServicesSontAssociesAuModeleMesureSpecifique(
        idsServices,
        idModele
      );
    if (!tousAssocies)
      throw new ErreurServiceNonAssocieAuModele(idsServices, idModele);

    const detacheDesServices = idsServices.map(async (unId) => {
      const s = await depotServices.service(unId);
      s.detacheMesureSpecfiqueDuModele(idModele);
      return s;
    });
    const aPersister = await Promise.all(detacheDesServices);

    await Promise.all(aPersister.map(depotServices.metsAJourService));
  };

  return {
    ajouteModeleMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
    detacheModeleMesureSpecifiqueDesServices,
  };
};

module.exports = { creeDepot };
