const {
  ErreurUtilisateurInexistant,
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

  const ajoutePlusieursModelesMesureSpecifique = async (
    idUtilisateur,
    donneesModeles
  ) => {
    const utilisateur = await persistance.utilisateur(idUtilisateur);
    if (!utilisateur) throw new ErreurUtilisateurInexistant();

    if (donneesModeles.length === 0) return;

    const donneesAPersister = await Promise.all(
      donneesModeles.map(async (donnees) => {
        const idModele = adaptateurUUID.genereUUID();
        const donneesChiffrees = await adaptateurChiffrement.chiffre(donnees);
        return [idModele, donneesChiffrees];
      })
    );

    await persistance.ajoutePlusieursModelesMesureSpecifique(
      idUtilisateur,
      Object.fromEntries(donneesAPersister)
    );
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
          idUtilisateur: m.idUtilisateur,
          idsServicesAssocies: m.ids_services_associes,
          ...donneesEnClair,
        };
      })
    );
  };

  const nbModelesMesureSpecifiquePourUtilisateur = async (idUtilisateur) =>
    persistance.nbModelesMesureSpecifiquePourUtilisateur(idUtilisateur);

  const dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService = async (
    idUtilisateur,
    idService
  ) => {
    const modelesDeUtilisateur =
      await lisModelesMesureSpecifiquePourUtilisateur(idUtilisateur);
    if (!modelesDeUtilisateur.length) return;

    const service = await depotServices.service(idService);
    const idsModelesDuService = service
      .mesuresSpecifiques()
      .listeIdentifiantsModelesAssocies();
    if (!idsModelesDuService.length) return;

    const idsModelesADissocier = modelesDeUtilisateur
      .filter((m) => idsModelesDuService.includes(m.id))
      .map((m) => m.id);
    if (!idsModelesADissocier.length) return;

    idsModelesADissocier.forEach((idModeleADissocier) => {
      service.detacheMesureSpecfiqueDuModele(idModeleADissocier);
    });

    await depotServices.metsAJourService(service);
    await persistance.supprimeAssociationModelesMesureSpecifiquePourUtilisateurSurService(
      idUtilisateur,
      idService
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

    await verificationsModificationModele.toutes(
      idModele,
      idsServicesAssocies,
      idUtilisateur
    );

    const detacheDesServices = idsServicesAssocies.map(async (unId) => {
      const s = await depotServices.service(unId);
      s.detacheMesureSpecfiqueDuModele(idModele);
      return s;
    });
    const aPersister = await Promise.all(detacheDesServices);
    await Promise.all(aPersister.map(depotServices.metsAJourService));
    await persistance.supprimeLeLienEntreLeModeleEtLesServices(
      idModele,
      idsServicesAssocies
    );

    await persistance.supprimeModeleMesureSpecifique(idModele);
  };

  const supprimeDesMesuresAssocieesAuModele = async (
    idUtilisateur,
    idModele,
    idsServices
  ) => {
    await verificationsModificationModele.queModeleExiste(idModele);
    if (idsServices.length > 0) {
      await verificationsModificationModele.queTousLesServicesExistent(
        idsServices
      );
      await verificationsModificationModele.aLesDroitsSuffisantsPourModifierUneMesureSurDesServices(
        idUtilisateur,
        idsServices
      );
    }

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

    await verificationsModificationModele.queModeleExiste(idModele);
    await verificationsModificationModele.queUtilisateurPossedeLeModele(
      idUtilisateur,
      idModele
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
    ajoutePlusieursModelesMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
    associeModelesMesureSpecifiqueAuService,
    dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService,
    lisModelesMesureSpecifiquePourUtilisateur,
    metsAJourModeleMesureSpecifique,
    nbModelesMesureSpecifiquePourUtilisateur,
    supprimeDesMesuresAssocieesAuModele,
    supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees,
    supprimeModeleMesureSpecifiqueEtMesuresAssociees,
  };
};

module.exports = { creeDepot };
