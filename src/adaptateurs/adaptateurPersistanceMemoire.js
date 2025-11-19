import { fabriqueAdaptateurHorloge } from './adaptateurHorloge.js';
import { unUUIDRandom } from '../../test/constructeurs/UUID.js';

const nouvelAdaptateur = (
  donnees = {},
  adaptateurHorloge = fabriqueAdaptateurHorloge()
) => {
  donnees.utilisateurs ||= [];
  donnees.services ||= [];
  donnees.autorisations ||= [];
  donnees.parcoursUtilisateurs ||= [];
  donnees.notificationsExpirationHomologation ||= [];
  donnees.notifications ||= [];
  donnees.suggestionsActions ||= [];
  donnees.activitesMesure ||= [];
  donnees.superviseurs ||= [];
  donnees.modelesMesureSpecifique ||= [];
  donnees.associationModelesMesureSpecifiqueServices ||= [];
  donnees.televersements = { modelesMesureSpecifique: [], services: [] };
  donnees.brouillonsServices ||= [];
  donnees.simulationsMigrationReferentiel ||= [];

  const ajouteTeleversementServices = async (
    idUtilisateur,
    donneesChiffrees,
    versionService
  ) => {
    const id = unUUIDRandom();
    donnees.televersements.services.push({
      id,
      idUtilisateur,
      donnees: { services: donneesChiffrees },
      versionService,
      progression: 0,
    });
    return id;
  };

  const lisTeleversementServices = async (idUtilisateur) =>
    donnees.televersements.services.find(
      (s) => s.idUtilisateur === idUtilisateur
    );

  const supprimeTeleversementServices = async (idUtilisateur) => {
    donnees.televersements.services = donnees.televersements.services.filter(
      (s) => s.idUtilisateur === idUtilisateur
    );
  };

  const lisProgressionTeleversementServices = async (idUtilisateur) => {
    const cible = donnees.televersements.services.find(
      (s) => s.idUtilisateur === idUtilisateur
    );
    return { progression: cible.progression };
  };

  const metsAJourProgressionTeleversement = async (
    idUtilisateur,
    progression
  ) => {
    const cible = donnees.televersements.services.find(
      (s) => s.idUtilisateur === idUtilisateur
    );
    cible.progression = progression;
  };

  const supprimeEnregistrement = async (nomTable, id) => {
    donnees[nomTable] = donnees[nomTable].filter((e) => e.id !== id);
  };

  const ajouteService = async (
    id,
    donneesService,
    nomServiceHash,
    siretHash,
    versionService
  ) => {
    donnees.services.push({
      id,
      donnees: donneesService,
      nomServiceHash,
      siretHash,
      versionService,
    });
  };

  const ajouteUtilisateur = async (id, donneesUtilisateur, emailHash) => {
    donnees.utilisateurs.push({
      id,
      donnees: donneesUtilisateur,
      dateCreation: adaptateurHorloge.maintenant(),
      emailHash,
    });
  };

  const autorisations = async (idUtilisateur) => {
    const seulementUnUtilisateur = typeof idUtilisateur !== 'undefined';

    const filtre = seulementUnUtilisateur
      ? (a) => a.idUtilisateur === idUtilisateur
      : (a) => a.estProprietaire;

    return donnees.autorisations.filter(filtre);
  };

  const serviceParId = async (id) => donnees.services.find((s) => s.id === id);

  const services = async (idUtilisateur) => {
    const as = await autorisations(idUtilisateur);
    return Promise.all(as.map(({ idService }) => serviceParId(idService)));
  };

  const servicesComplets = async ({
    idUtilisateur,
    idService,
    hashSiret,
    tous,
  }) => {
    const servicesRetenus = [];

    if (idService) {
      const parId = await serviceParId(idService);
      if (parId) servicesRetenus.push(parId);
    } else if (idUtilisateur) {
      const deUtilisateur = await services(idUtilisateur);
      servicesRetenus.push(...deUtilisateur);
    } else if (hashSiret) {
      const duSiret = donnees.services.filter((s) => s.siretHash === hashSiret);
      servicesRetenus.push(...duSiret);
    } else if (tous) {
      const tousServices = await Promise.all(
        donnees.services.map((s) => s.id).map(serviceParId)
      );
      servicesRetenus.push(...tousServices);
    }

    return servicesRetenus.map((unService) => {
      const autorisationsDuService = donnees.autorisations.filter(
        (a) => a.idService === unService.id
      );
      const modelesDuService = donnees.modelesMesureSpecifique.filter(
        ({ idUtilisateur: idU }) =>
          autorisationsDuService.map((a) => a.idUtilisateur).includes(idU)
      );
      return {
        ...unService,
        utilisateurs: autorisationsDuService.map((a) =>
          donnees.utilisateurs.find((u) => u.id === a.idUtilisateur)
        ),
        suggestions: donnees.suggestionsActions
          .filter((s) => s.idService === unService.id)
          .map((suggestion) => suggestion.nature),
        modelesDisponiblesDeMesureSpecifique: modelesDuService.map(
          ({ id, donnees: d, idUtilisateur: u }) => ({
            id,
            donnees: d,
            idUtilisateur: u,
          })
        ),
      };
    });
  };

  const nombreServices = async (idUtilisateur) => {
    const as = await autorisations(idUtilisateur);
    return as.length;
  };

  const serviceExisteAvecHashNom = async (
    idUtilisateur,
    hashNomService,
    idServiceMisAJour
  ) => {
    const lesServices = await services(idUtilisateur);
    return lesServices.some(
      (s) => s.id !== idServiceMisAJour && s.nomServiceHash === hashNomService
    );
  };

  const metsAJourService = async (
    id,
    donneesService,
    nomServiceHash,
    siretHash
  ) => {
    const s = await serviceParId(id);
    Object.assign(s, { nomServiceHash, siretHash, donnees: donneesService });
  };

  const sauvegardeAutorisation = async (id, donneesAutorisation) => {
    const dejaConnue = donnees.autorisations.find((a) => a.id === id);

    if (!dejaConnue) donnees.autorisations.push({ id, ...donneesAutorisation });
    else Object.assign(dejaConnue, { ...donneesAutorisation });
  };

  const sauvegardeService = (
    id,
    donneesService,
    nomServiceHash,
    siretHash,
    versionService
  ) => {
    const dejaConnu = donnees.services.find((s) => s.id === id) !== undefined;
    return dejaConnu
      ? metsAJourService(id, donneesService, nomServiceHash, siretHash)
      : ajouteService(
          id,
          donneesService,
          nomServiceHash,
          siretHash,
          versionService
        );
  };

  const supprimeService = (...params) =>
    supprimeEnregistrement('services', ...params);

  const supprimeServices = async () => {
    donnees.services = [];
  };

  const supprimeUtilisateur = (...params) =>
    supprimeEnregistrement('utilisateurs', ...params);

  const supprimeUtilisateurs = async () => {
    donnees.utilisateurs = [];
  };

  const utilisateur = async (id) =>
    donnees.utilisateurs.find((u) => u.id === id);

  const metsAJourIdResetMdpUtilisateur = async (id, idResetMotDePasse) => {
    const u = await utilisateur(id);
    Object.assign(u, { idResetMotDePasse });
  };

  const metsAJourUtilisateur = async (id, donneesAMettreAJour, emailHash) => {
    const u = await utilisateur(id);
    Object.assign(u.donnees, donneesAMettreAJour);
    if (emailHash) {
      u.emailHash = emailHash;
    }
  };

  const utilisateurAvecEmailHash = async (emailHash) =>
    donnees.utilisateurs.find((u) => u.emailHash === emailHash);

  const utilisateurAvecIdReset = async (idReset) =>
    donnees.utilisateurs.find((u) => u.idResetMotDePasse === idReset);

  const tousUtilisateurs = async () => donnees.utilisateurs;

  const autorisation = async (id) =>
    donnees.autorisations.find((a) => a.id === id);

  const autorisationsDuService = async (idService) =>
    donnees.autorisations.filter((a) => a.idService === idService);

  const autorisationPour = async (idUtilisateur, idService) =>
    donnees.autorisations.find(
      (a) => a.idUtilisateur === idUtilisateur && a.idService === idService
    );

  const ajouteAutorisation = async (id, donneesAutorisation) => {
    donnees.autorisations.push(Object.assign(donneesAutorisation, { id }));
  };

  const nbAutorisationsProprietaire = async (idUtilisateur) =>
    donnees.autorisations.filter(
      (a) => a.idUtilisateur === idUtilisateur && a.estProprietaire
    ).length;

  const supprimeAutorisation = async (idUtilisateur, idService) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idUtilisateur !== idUtilisateur || a.idService !== idService
    );
  };

  const supprimeAutorisations = async () => {
    donnees.autorisations = [];
  };

  const supprimeAutorisationsContribution = async (idUtilisateur) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idUtilisateur !== idUtilisateur || a.estProprietaire
    );
  };

  const supprimeAutorisationsHomologation = async (idService) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idService !== idService
    );
  };

  const lisParcoursUtilisateur = async (id) =>
    donnees.parcoursUtilisateurs.find((p) => p.id === id);

  const sauvegardeParcoursUtilisateur = async (
    id,
    donneesParcoursUtilisateur
  ) => {
    const dejaConnu = donnees.parcoursUtilisateurs.find((p) => p.id === id);

    if (!dejaConnu)
      donnees.parcoursUtilisateurs.push({ id, ...donneesParcoursUtilisateur });
    else Object.assign(dejaConnu, { ...donneesParcoursUtilisateur });
  };

  const contributeursDesServicesDe = async (idProprietaire) => {
    const idServices = donnees.autorisations
      .filter((a) => a.idUtilisateur === idProprietaire && a.estProprietaire)
      .map((a) => a.idService);

    const idUniquesContributeurs = donnees.autorisations
      .filter((a) => idServices.includes(a.idService) && !a.estProprietaire)
      .map((a) => a.idUtilisateur);

    return donnees.utilisateurs.filter((u) =>
      idUniquesContributeurs.includes(u.id)
    );
  };

  const lisNotificationsExpirationHomologationDansIntervalle = async (
    debut,
    fin
  ) => {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    return donnees.notificationsExpirationHomologation.filter(
      (n) => dateDebut <= n.dateProchainEnvoi && n.dateProchainEnvoi < dateFin
    );
  };

  const sauvegardeNotificationsExpirationHomologation = async (
    notifications
  ) => {
    donnees.notificationsExpirationHomologation = [
      ...donnees.notificationsExpirationHomologation,
      ...notifications,
    ];
  };

  const supprimeNotificationsExpirationHomologation = async (ids) => {
    donnees.notificationsExpirationHomologation =
      donnees.notificationsExpirationHomologation.filter(
        (n) => !ids.includes(n.id)
      );
  };

  const supprimeNotificationsExpirationHomologationPourService = async (
    idService
  ) => {
    donnees.notificationsExpirationHomologation =
      donnees.notificationsExpirationHomologation.filter(
        (n) => n.idService !== idService
      );
  };

  const marqueNouveauteLue = async (idUtilisateur, idNouveaute) => {
    donnees.notifications[`${idUtilisateur}-${idNouveaute}`] = {
      idUtilisateur,
      idNouveaute,
    };
  };

  const nouveautesPourUtilisateur = async (idUtilisateur) =>
    Object.entries(donnees.notifications)
      .filter(([_cle, valeur]) => valeur.idUtilisateur === idUtilisateur)
      .map((_cle, valeur) => valeur.idNouveaute);

  const tachesDeServicePour = async () => [];

  const marqueTacheDeServiceLue = async () => {};

  const marqueSuggestionActionFaiteMaintenant = async () => {};

  const ajouteSuggestionAction = async () => {};

  const ajouteTacheDeService = async () => {};

  const activitesMesure = async (idService, idMesure) =>
    donnees.activitesMesure.filter(
      (a) => a.idService === idService && a.idMesure === idMesure
    );

  const ajouteActiviteMesure = (
    idActeur,
    idService,
    idMesure,
    type,
    typeMesure,
    details
  ) =>
    donnees.activitesMesure.push({
      idActeur,
      idService,
      idMesure,
      type,
      typeMesure,
      details,
    });

  const lisSuperviseursConcernes = async (siret) =>
    donnees.superviseurs
      .filter(({ entiteSupervisee }) => entiteSupervisee.siret === siret)
      .map(({ idSuperviseur }) => idSuperviseur);

  const ajouteEntiteAuSuperviseur = async (idSuperviseur, entite) =>
    donnees.superviseurs.push({ idSuperviseur, entiteSupervisee: entite });

  const estSuperviseur = async (idUtilisateur) =>
    donnees.superviseurs.some(
      ({ idSuperviseur }) => idSuperviseur === idUtilisateur
    );

  const superviseur = async (idUtilisateur) => {
    const entitesSupervisees = donnees.superviseurs
      .filter(({ idSuperviseur }) => idSuperviseur === idUtilisateur)
      .map(({ entiteSupervisee }) => entiteSupervisee);
    if (entitesSupervisees && entitesSupervisees.length > 0) {
      return { idUtilisateur, entitesSupervisees };
    }
    return undefined;
  };

  const verifieTousLesServicesExistent = async (idsServices) =>
    idsServices.every((unId) => donnees.services.find((s) => s.id === unId));

  const verifieServiceExiste = async (idService) =>
    verifieTousLesServicesExistent([idService]);

  const ajouteModeleMesureSpecifique = async (
    id,
    idUtilisateur,
    donneesModele
  ) =>
    donnees.modelesMesureSpecifique.push({
      id,
      idUtilisateur,
      donnees: donneesModele,
    });

  const ajoutePlusieursModelesMesureSpecifique = async (
    idUtilisateur,
    donneesModeles
  ) =>
    Object.entries(donneesModeles).forEach(([id, donneesModele]) => {
      donnees.modelesMesureSpecifique.push({
        id,
        idUtilisateur,
        donnees: donneesModele,
      });
    });

  const supprimeModeleMesureSpecifique = async (id) => {
    donnees.modelesMesureSpecifique = donnees.modelesMesureSpecifique.filter(
      (m) => m.id !== id
    );
    donnees.associationModelesMesureSpecifiqueServices =
      donnees.associationModelesMesureSpecifiqueServices.filter(
        (a) => a.idModele !== id
      );
  };

  const metsAJourModeleMesureSpecifique = async (
    id,
    idUtilisateur,
    donneesModele
  ) => {
    const leModele = donnees.modelesMesureSpecifique.find(
      (m) => m.id === id && m.idUtilisateur === idUtilisateur
    );
    leModele.donnees = donneesModele;
  };

  const modeleMesureSpecifiqueAppartientA = async (idUtilisateur, idModele) =>
    donnees.modelesMesureSpecifique.find(
      (m) => m.id === idModele && m.idUtilisateur === idUtilisateur
    ) !== undefined;

  const associeModeleMesureSpecifiqueAuxServices = async (
    idModele,
    idsServices
  ) =>
    idsServices.forEach((idService) =>
      donnees.associationModelesMesureSpecifiqueServices.push({
        idModele,
        idService,
      })
    );

  const associeModelesMesureSpecifiqueAuService = async (
    idsModeles,
    idService
  ) =>
    idsModeles.forEach((idModele) =>
      donnees.associationModelesMesureSpecifiqueServices.push({
        idModele,
        idService,
      })
    );

  const supprimeLeLienEntreLeModeleEtLesServices = async (
    idModele,
    idsServices
  ) => {
    donnees.associationModelesMesureSpecifiqueServices =
      donnees.associationModelesMesureSpecifiqueServices.filter((a) => {
        const estUnLien =
          a.idModele === idModele && idsServices.includes(a.idService);
        return !estUnLien;
      });
  };

  const supprimeTousLiensEntreUnServiceEtModelesMesureSpecifique = async (
    idService
  ) => {
    donnees.associationModelesMesureSpecifiqueServices =
      donnees.associationModelesMesureSpecifiqueServices.filter(
        (a) => a.idService === idService
      );
  };

  const verifieModeleMesureSpecifiqueExiste = async (idModele) =>
    donnees.modelesMesureSpecifique.find((m) => m.id === idModele) !==
    undefined;

  const tousServicesSontAssociesAuModeleMesureSpecifique = async (
    idsServices,
    idModele
  ) =>
    idsServices.every(
      (unId) =>
        donnees.associationModelesMesureSpecifiqueServices.find(
          (a) => a.idService === unId && a.idModele === idModele
        ) !== undefined
    );

  const lisModelesMesureSpecifiquePourUtilisateur = async (idUtilisateur) =>
    donnees.modelesMesureSpecifique
      .filter((m) => m.idUtilisateur === idUtilisateur)
      .map((m) => ({
        ...m,
        ids_services_associes:
          donnees.associationModelesMesureSpecifiqueServices
            .filter((a) => a.idModele === m.id)
            .map((a) => a.idService),
      }));

  const nbModelesMesureSpecifiquePourUtilisateur = async (idUtilisateur) =>
    donnees.modelesMesureSpecifique.filter(
      (m) => m.idUtilisateur === idUtilisateur
    ).length;

  const supprimeAssociationModelesMesureSpecifiquePourUtilisateurSurService =
    async (idUtilisateur, idService) => {
      const modeles =
        await lisModelesMesureSpecifiquePourUtilisateur(idUtilisateur);
      const idsModeles = modeles.map((m) => m.id);
      donnees.associationModelesMesureSpecifiqueServices =
        donnees.associationModelesMesureSpecifiqueServices.filter(
          (a) => !(a.idService === idService && idsModeles.includes(a.idModele))
        );
    };

  const ajouteTeleversementModelesMesureSpecifique = async (
    idUtilisateur,
    donneesTeleversement
  ) => {
    donnees.televersements.modelesMesureSpecifique.push({
      idUtilisateur,
      donneesTeleversement,
    });
  };

  const lisTeleversementModelesMesureSpecifique = async (idUtilisateur) =>
    donnees.televersements.modelesMesureSpecifique.find(
      (m) => m.idUtilisateur === idUtilisateur
    )?.donneesTeleversement;

  const supprimeTeleversementModelesMesureSpecifique = async (
    idUtilisateur
  ) => {
    donnees.televersements.modelesMesureSpecifique =
      donnees.televersements.modelesMesureSpecifique.filter(
        (m) => m.idUtilisateur !== idUtilisateur
      );
  };

  const ajouteBrouillonService = async (
    id,
    idUtilisateur,
    donneesBrouillon
  ) => {
    donnees.brouillonsServices.push({
      id,
      idUtilisateur,
      donnees: donneesBrouillon,
    });
  };

  const sauvegardeBrouillonService = async (
    id,
    idUtilisateur,
    donneesBrouillon
  ) => {
    const leBrouillon = donnees.brouillonsServices.find(
      (b) => b.id === id && b.idUtilisateur === idUtilisateur
    );
    leBrouillon.donnees = donneesBrouillon;
  };

  const lisBrouillonsService = async (idUtilisateur) =>
    donnees.brouillonsServices.filter((b) => b.idUtilisateur === idUtilisateur);

  const supprimeBrouillonService = async (idBrouillon) => {
    donnees.brouillonsServices = donnees.brouillonsServices.filter(
      (b) => b.id !== idBrouillon
    );
  };

  const versionsServiceUtiliseesParUtilisateur = async (idUtilisateur) => {
    const lesServices = await services(idUtilisateur);
    return [...new Set(lesServices.map((s) => s.versionService))];
  };

  const lisSimulationMigrationReferentiel = async (idService) =>
    donnees.simulationsMigrationReferentiel.find(
      (s) => s.idService === idService
    );

  const sauvegardeSimulationMigrationReferentiel = async (
    idService,
    donneesSimulation
  ) => {
    donnees.simulationsMigrationReferentiel.push({
      idService,
      ...donneesSimulation,
    });
  };

  return {
    activitesMesure,
    ajouteActiviteMesure,
    ajouteAutorisation,
    ajouteBrouillonService,
    ajouteEntiteAuSuperviseur,
    ajouteModeleMesureSpecifique,
    ajoutePlusieursModelesMesureSpecifique,
    ajouteSuggestionAction,
    ajouteTacheDeService,
    ajouteTeleversementModelesMesureSpecifique,
    ajouteTeleversementServices,
    ajouteUtilisateur,
    associeModeleMesureSpecifiqueAuxServices,
    associeModelesMesureSpecifiqueAuService,
    autorisation,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    contributeursDesServicesDe,
    estSuperviseur,
    lisBrouillonsService,
    lisModelesMesureSpecifiquePourUtilisateur,
    lisNotificationsExpirationHomologationDansIntervalle,
    lisParcoursUtilisateur,
    lisProgressionTeleversementServices,
    lisSimulationMigrationReferentiel,
    lisSuperviseursConcernes,
    lisTeleversementModelesMesureSpecifique,
    lisTeleversementServices,
    marqueNouveauteLue,
    marqueSuggestionActionFaiteMaintenant,
    marqueTacheDeServiceLue,
    metsAJourIdResetMdpUtilisateur,
    metsAJourModeleMesureSpecifique,
    metsAJourProgressionTeleversement,
    metsAJourUtilisateur,
    modeleMesureSpecifiqueAppartientA,
    nbAutorisationsProprietaire,
    nbModelesMesureSpecifiquePourUtilisateur,
    nombreServices,
    nouveautesPourUtilisateur,
    sauvegardeAutorisation,
    sauvegardeBrouillonService,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeParcoursUtilisateur,
    sauvegardeService,
    sauvegardeSimulationMigrationReferentiel,
    serviceExisteAvecHashNom,
    servicesComplets,
    superviseur,
    supprimeAssociationModelesMesureSpecifiquePourUtilisateurSurService,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeBrouillonService,
    supprimeLeLienEntreLeModeleEtLesServices,
    supprimeModeleMesureSpecifique,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeService,
    supprimeServices,
    supprimeTeleversementModelesMesureSpecifique,
    supprimeTeleversementServices,
    supprimeTousLiensEntreUnServiceEtModelesMesureSpecifique,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    tachesDeServicePour,
    tousServicesSontAssociesAuModeleMesureSpecifique,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmailHash,
    utilisateurAvecIdReset,
    verifieModeleMesureSpecifiqueExiste,
    verifieServiceExiste,
    verifieTousLesServicesExistent,
    versionsServiceUtiliseesParUtilisateur,
  };
};

export { nouvelAdaptateur };
