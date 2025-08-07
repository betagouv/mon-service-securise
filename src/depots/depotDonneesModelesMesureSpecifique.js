const {
  ErreurUtilisateurInexistant,
  ErreurServiceNonAssocieAuModele,
  ErreurServiceInexistant,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
} = require('../erreurs');
const {
  VerificationsUtilisateurPeutMuterModele,
} = require('./modelesMesureSpecifique/VerificationsUtilisateurPeutMuterModele');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurPersistance: persistance,
    adaptateurUUID,
    depotAutorisations,
    depotServices,
  } = config;

  const verificationsModificationModele =
    new VerificationsUtilisateurPeutMuterModele({
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

    return idModele;
  };

  const metsAJourModeleMesureSpecifique = async (
    idUtilisateur,
    idModele,
    donnees
  ) => {
    const utilisateur = await persistance.utilisateur(idUtilisateur);
    if (!utilisateur) throw new ErreurUtilisateurInexistant();

    await verificationsModificationModele.queModeleExiste(idModele);
    await verificationsModificationModele.queUtilisateurPossedeLeModele(
      idUtilisateur,
      idModele
    );

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
    await verificationsModificationModele.toutes(
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

  const associeModelesMesureSpecifiqueAuService = async (
    idsModeles,
    idService,
    idUtilisateurAssociant
  ) => {
    const service = await depotServices.service(idService);
    if (!service) throw new ErreurServiceInexistant();

    await verificationsModificationModele.aLesDroitsSuffisantsPourModifierUneMesureSurDesServices(
      idUtilisateurAssociant,
      [idService]
    );

    const idsModelesDeUtilisateur = (
      await persistance.lisModelesMesureSpecifiquePourUtilisateur(
        idUtilisateurAssociant
      )
    ).map((modele) => modele.id);
    if (
      !idsModeles.every((idModele) =>
        idsModelesDeUtilisateur.includes(idModele)
      )
    )
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable();

    idsModeles.forEach((idModele) => {
      const idNouvelleMesure = adaptateurUUID.genereUUID();
      service.associeMesureSpecifiqueAuModele(idModele, idNouvelleMesure);
    });
    await depotServices.metsAJourService(service);

    await persistance.associeModelesMesureSpecifiqueAuService(
      idsModeles,
      idService
    );
  };

  const detacheModeleMesureSpecifiqueDesServices = async (
    idModele,
    idsServices,
    idUtilisateurDetachant
  ) => {
    await verificationsModificationModele.toutes(
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

  const supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees = async (
    idUtilisateur,
    idModele
  ) => {
    const modeles =
      await persistance.lisModelesMesureSpecifiquePourUtilisateur(
        idUtilisateur
      );
    const modeleASupprimer = modeles.find((m) => m.id === idModele);
    const idsServicesAssocies = modeleASupprimer?.ids_services_associes || [];

    await detacheModeleMesureSpecifiqueDesServices(
      idModele,
      idsServicesAssocies,
      idUtilisateur
    );

    await persistance.supprimeModeleMesureSpecifique(idModele);
  };

  const supprimeDesMesuresAssocieesAuModele = async (
    idUtilisateur,
    idModele,
    idsServices
  ) => {
    await verificationsModificationModele.toutes(
      idModele,
      idsServices,
      idUtilisateur
    );

    if (idsServices.length === 0) return;

    const supprimeMesureSpecifiqueAssociee = idsServices.map(async (unId) => {
      const s = await depotServices.service(unId);
      s.supprimeMesureSpecifiqueAssocieeAuModele(idModele);
      return s;
    });
    const aPersister = await Promise.all(supprimeMesureSpecifiqueAssociee);
    await Promise.all(aPersister.map(depotServices.metsAJourService));

    await persistance.supprimeLeLienEntreLeModeleEtLesServices(
      idModele,
      idsServices
    );
  };

  const supprimeModeleMesureSpecifiqueEtMesuresAssociees = async (
    idUtilisateur,
    idModele
  ) => {
    const modeles =
      await persistance.lisModelesMesureSpecifiquePourUtilisateur(
        idUtilisateur
      );
    const modeleASupprimer = modeles.find((m) => m.id === idModele);
    const idsServicesAssocies = modeleASupprimer?.ids_services_associes || [];

    await supprimeDesMesuresAssocieesAuModele(
      idUtilisateur,
      idModele,
      idsServicesAssocies
    );

    await persistance.supprimeModeleMesureSpecifique(idModele);
  };

  return {
    ajouteModeleMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
    associeModelesMesureSpecifiqueAuService,
    detacheModeleMesureSpecifiqueDesServices,
    lisModelesMesureSpecifiquePourUtilisateur,
    metsAJourModeleMesureSpecifique,
    supprimeDesMesuresAssocieesAuModele,
    supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees,
    supprimeModeleMesureSpecifiqueEtMesuresAssociees,
  };
};

module.exports = { creeDepot };
