const adaptateurHorlogeParDefaut = require('./adaptateurHorloge');

const nouvelAdaptateur = (
  donnees = {},
  adaptateurHorloge = adaptateurHorlogeParDefaut
) => {
  donnees.utilisateurs ||= [];
  donnees.services ||= [];
  donnees.autorisations ||= [];
  donnees.parcoursUtilisateurs ||= [];
  donnees.notificationsExpirationHomologation ||= [];

  const metsAJourEnregistrement = (
    fonctionRecherche,
    id,
    donneesAMettreAJour
  ) =>
    fonctionRecherche(id)
      .then((e) => Object.assign(e, donneesAMettreAJour))
      .then(() => {});

  const supprimeEnregistrement = (nomTable, id) => {
    donnees[nomTable] = donnees[nomTable].filter((e) => e.id !== id);
    return Promise.resolve();
  };

  const ajouteService = (id, donneesService) => {
    donnees.services.push({ id, ...donneesService });
    return Promise.resolve();
  };

  const ajouteUtilisateur = (id, donneesUtilisateur) => {
    donnees.utilisateurs.push(
      Object.assign(donneesUtilisateur, {
        id,
        dateCreation: adaptateurHorloge.maintenant(),
      })
    );
    return Promise.resolve();
  };

  const autorisations = (idUtilisateur) => {
    const seulementUnUtilisateur = typeof idUtilisateur !== 'undefined';

    const filtre = seulementUnUtilisateur
      ? (a) => a.idUtilisateur === idUtilisateur
      : (a) => a.estProprietaire;

    return Promise.resolve(donnees.autorisations.filter(filtre));
  };

  const contributeursService = (idService) =>
    donnees.autorisations
      .filter((a) => a.idHomologation === idService)
      .map((a) => donnees.utilisateurs.find((u) => u.id === a.idUtilisateur));

  const service = (id) => {
    const serviceTrouve = donnees.services.find((s) => s.id === id);
    if (serviceTrouve) serviceTrouve.contributeurs = contributeursService(id);

    return Promise.resolve(serviceTrouve);
  };

  const services = (idUtilisateur) =>
    autorisations(idUtilisateur).then((as) =>
      Promise.all(as.map(({ idHomologation }) => service(idHomologation)))
    );

  const tousLesServices = async () => {
    const lesIds = donnees.services.map((s) => s.id);
    return lesIds.map(service);
  };

  const serviceAvecNom = (idUtilisateur, nomService, idHomologationMiseAJour) =>
    services(idUtilisateur).then((hs) =>
      hs.find(
        (h) =>
          h.id !== idHomologationMiseAJour &&
          h.descriptionService?.nomService === nomService
      )
    );

  const metsAJourService = (...params) =>
    metsAJourEnregistrement(service, ...params);

  const sauvegardeAutorisation = async (id, donneesAutorisation) => {
    const dejaConnue = donnees.autorisations.find((a) => a.id === id);

    if (!dejaConnue) donnees.autorisations.push({ id, ...donneesAutorisation });
    else Object.assign(dejaConnue, { ...donneesAutorisation });
  };

  const sauvegardeService = (id, donneesService) => {
    const dejaConnu = donnees.services.find((s) => s.id === id) !== undefined;
    return dejaConnu
      ? metsAJourService(id, donneesService)
      : ajouteService(id, donneesService);
  };

  const supprimeServices = () => {
    donnees.services = [];
    return Promise.resolve();
  };

  const supprimeService = (...params) =>
    supprimeEnregistrement('services', ...params);

  const supprimeUtilisateur = (...params) =>
    supprimeEnregistrement('utilisateurs', ...params);

  const supprimeUtilisateurs = () => {
    donnees.utilisateurs = [];
    return Promise.resolve();
  };

  const utilisateur = (id) =>
    Promise.resolve(donnees.utilisateurs.find((u) => u.id === id));

  const metsAJourUtilisateur = (...params) =>
    metsAJourEnregistrement(utilisateur, ...params);

  const utilisateurAvecEmail = (email) =>
    Promise.resolve(donnees.utilisateurs.find((u) => u.email === email));

  const utilisateurAvecIdReset = (idReset) =>
    Promise.resolve(
      donnees.utilisateurs.find((u) => u.idResetMotDePasse === idReset)
    );

  const tousUtilisateurs = () => Promise.resolve(donnees.utilisateurs);

  const autorisation = (id) =>
    Promise.resolve(donnees.autorisations.find((a) => a.id === id));

  const autorisationsDuService = async (idService) =>
    donnees.autorisations.filter((a) => a.idService === idService);

  const autorisationPour = (idUtilisateur, idHomologation) =>
    Promise.resolve(
      donnees.autorisations.find(
        (a) =>
          a.idUtilisateur === idUtilisateur &&
          a.idHomologation === idHomologation
      )
    );

  const ajouteAutorisation = (id, donneesAutorisation) => {
    donnees.autorisations.push(Object.assign(donneesAutorisation, { id }));
    return Promise.resolve();
  };

  const nbAutorisationsProprietaire = (idUtilisateur) =>
    Promise.resolve(
      donnees.autorisations.filter(
        (a) => a.idUtilisateur === idUtilisateur && a.estProprietaire
      ).length
    );

  const supprimeAutorisation = (idUtilisateur, idHomologation) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) =>
        a.idUtilisateur !== idUtilisateur || a.idHomologation !== idHomologation
    );
    return Promise.resolve();
  };

  const supprimeAutorisations = () =>
    Promise.resolve((donnees.autorisations = []));

  const supprimeAutorisationsContribution = async (idUtilisateur) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idUtilisateur !== idUtilisateur || a.estProprietaire
    );
  };

  const supprimeAutorisationsHomologation = (idHomologation) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idHomologation !== idHomologation
    );
    return Promise.resolve();
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

  const rechercheContributeurs = async (idUtilisateur, recherche) => {
    const idServices = donnees.autorisations
      .filter((a) => a.idUtilisateur === idUtilisateur && a.estProprietaire)
      .map((a) => a.idService);
    const idUniquesContributeurs = donnees.autorisations.filter(
      (a) => idServices.includes(a.idService) && !a.estProprietaire
    );
    const tousContributeurs = donnees.utilisateurs.filter((u) =>
      idUniquesContributeurs.includes(u.id)
    );

    const rechercheMinuscule = recherche.toLowerCase();
    return tousContributeurs.filter(
      (c) =>
        c.email.toLowerCase().includes(rechercheMinuscule) ||
        c.prenom?.toLowerCase().includes(rechercheMinuscule) ||
        c.nom?.toLowerCase().includes(rechercheMinuscule)
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

  return {
    ajouteAutorisation,
    ajouteUtilisateur,
    autorisation,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    service,
    services,
    serviceAvecNom,
    lisNotificationsExpirationHomologationDansIntervalle,
    lisParcoursUtilisateur,
    metsAJourUtilisateur,
    nbAutorisationsProprietaire,
    rechercheContributeurs,
    sauvegardeAutorisation,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeParcoursUtilisateur,
    sauvegardeService,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeServices,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeService,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    tousLesServices,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
