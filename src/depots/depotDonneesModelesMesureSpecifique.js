const {
  ErreurUtilisateurInexistant,
  ErreurServiceNonAssocieAuModele,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
} = require('../erreurs');
const {
  VerificationsAssocieOuDetache,
} = require('./modelesMesureSpecifique/VerificationsAssocieOuDetache');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurPersistance: persistance,
    adaptateurUUID,
    depotAutorisations,
    depotServices,
  } = config;

  const verificationsAssocieOuDetache = new VerificationsAssocieOuDetache({
    adaptateurPersistance: persistance,
    depotAutorisations,
  });

  const ajouteModeleMesureSpecifique = async (idUtilisateur, donnees) => {
    const utilisateur = await persistance.utilisateur(idUtilisateur);
    if (!utilisateur) throw new ErreurUtilisateurInexistant();

    const idModele = adaptateurUUID.genereUUID();
    const donneesChiffrees = await adaptateurChiffrement.chiffre(donnees);

    await persistance.ajouteModeleMesureSpecifique(
      idModele,
      idUtilisateur,
      donneesChiffrees
    );
  };

  const metsAJourModeleMesureSpecifique = async (
    idUtilisateur,
    idModele,
    donnees
  ) => {
    const utilisateur = await persistance.utilisateur(idUtilisateur);
    if (!utilisateur) throw new ErreurUtilisateurInexistant();

    const modeleExiste =
      await persistance.verifieModeleMesureSpecifiqueExiste(idModele);
    if (!modeleExiste)
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable(idModele);

    const donneesChiffrees = await adaptateurChiffrement.chiffre(donnees);
    await persistance.metsAJourModeleMesureSpecifique(
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

    await persistance.associeModeleMesureSpecifiqueAuxServices(
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
      await persistance.tousServicesSontAssociesAuModeleMesureSpecifique(
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
    await persistance.supprimeLeLienEntreLeModeleEtLesServices(
      idModele,
      idsServices
    );
  };

  const lisModelesMesureSpecifiquePourUtilisateur = async (idUtilisateur) => {
    const modeles =
      await persistance.lisModelesMesureSpecifiquePourUtilisateur(
        idUtilisateur
      );

    return Promise.all(
      modeles.map(async (m) => {
        const donneesEnClair = await adaptateurChiffrement.dechiffre(m.donnees);
        return {
          id: m.id,
          idsServicesAssocies: m.ids_services_associes,
          ...donneesEnClair,
        };
      })
    );
  };

  return {
    ajouteModeleMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
    detacheModeleMesureSpecifiqueDesServices,
    lisModelesMesureSpecifiquePourUtilisateur,
    metsAJourModeleMesureSpecifique,
  };
};

module.exports = { creeDepot };
