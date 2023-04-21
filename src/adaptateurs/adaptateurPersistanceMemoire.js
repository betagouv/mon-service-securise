const adaptateurHorlogeParDefaut = require('./adaptateurHorloge');

const nouvelAdaptateur = (donnees = {}, adaptateurHorloge = adaptateurHorlogeParDefaut) => {
  donnees.utilisateurs ||= [];
  donnees.homologations ||= [];
  donnees.services ||= [];
  donnees.autorisations ||= [];

  const metsAJourEnregistrement = (fonctionRecherche, id, donneesAMettreAJour) => (
    fonctionRecherche(id)
      .then((e) => Object.assign(e, donneesAMettreAJour))
      .then(() => {})
  );

  const supprimeEnregistrement = (nomTable, id) => {
    donnees[nomTable] = donnees[nomTable].filter((e) => e.id !== id);
    return Promise.resolve();
  };

  const ajouteHomologation = (id, donneesHomologation) => {
    donnees.homologations.push(Object.assign(donneesHomologation, { id }));
    return Promise.resolve();
  };

  const ajouteService = (id, donneesService) => {
    donnees.services.push(Object.assign(donneesService, { id }));
    return Promise.resolve();
  };

  const ajouteUtilisateur = (id, donneesUtilisateur) => {
    donnees.utilisateurs.push(
      Object.assign(donneesUtilisateur, { id, dateCreation: adaptateurHorloge.maintenant() })
    );
    return Promise.resolve();
  };

  const autorisations = (idUtilisateur) => {
    const seulementUnUtilisateur = typeof idUtilisateur !== 'undefined';

    const filtre = seulementUnUtilisateur
      ? (a) => a.idUtilisateur === idUtilisateur
      : (a) => a.type === 'createur';

    return Promise.resolve(donnees.autorisations.filter(filtre));
  };

  const intervenantsHomologation = (idHomologation) => donnees.autorisations
    .filter((a) => a.idHomologation === idHomologation)
    .reduce((acc, a) => {
      acc[`${a.type}s`].push(donnees.utilisateurs.find((u) => u.id === a.idUtilisateur));
      return acc;
    }, { createurs: [], contributeurs: [] });

  const intervenantsService = (idService) => donnees.autorisations
    .filter((a) => a.idService === idService)
    .reduce((acc, a) => {
      acc[`${a.type}s`].push(donnees.utilisateurs.find((u) => u.id === a.idUtilisateur));
      return acc;
    }, { createurs: [], contributeurs: [] });

  const homologation = (id) => {
    const homologationTrouvee = donnees.homologations.find((h) => h.id === id);
    if (homologationTrouvee) {
      const intervenants = intervenantsHomologation(id);
      [homologationTrouvee.createur] = intervenants.createurs;
      homologationTrouvee.contributeurs = intervenants.contributeurs;
    }
    return Promise.resolve(homologationTrouvee);
  };

  const service = (id) => {
    const serviceTrouve = donnees.services.find((s) => s.id === id);
    if (serviceTrouve) {
      const intervenants = intervenantsService(id);
      [serviceTrouve.createur] = intervenants.createurs;
      serviceTrouve.contributeurs = intervenants.contributeurs;
    }
    return Promise.resolve(serviceTrouve);
  };

  const services = (idUtilisateur) => autorisations(idUtilisateur)
    .then((as) => Promise.all(
      as.map(({ idService }) => service(idService))
    ));

  const serviceAvecNomService = (idUtilisateur, nomService, idServiceMiseAJour) => (
    services(idUtilisateur)
      .then((lesServices) => lesServices.find((s) => (
        s.id !== idServiceMiseAJour && s.descriptionService?.nomService === nomService
      )))
  );

  const metsAJourHomologation = (...params) => metsAJourEnregistrement(homologation, ...params);

  const metsAJourService = (...params) => metsAJourEnregistrement(service, ...params);

  const supprimeHomologation = (...params) => supprimeEnregistrement('homologations', ...params);

  const supprimeHomologations = () => {
    donnees.homologations = [];
    return Promise.resolve();
  };

  const supprimeService = (...params) => supprimeEnregistrement('services', ...params);

  const supprimeServices = () => {
    donnees.services = [];
    return Promise.resolve();
  };

  const supprimeUtilisateur = (...params) => supprimeEnregistrement('utilisateurs', ...params);

  const supprimeUtilisateurs = () => {
    donnees.utilisateurs = [];
    return Promise.resolve();
  };

  const utilisateur = (id) => Promise.resolve(donnees.utilisateurs.find((u) => u.id === id));

  const metsAJourUtilisateur = (...params) => metsAJourEnregistrement(utilisateur, ...params);

  const utilisateurAvecEmail = (email) => Promise.resolve(
    donnees.utilisateurs.find((u) => u.email === email)
  );

  const utilisateurAvecIdReset = (idReset) => Promise.resolve(
    donnees.utilisateurs.find((u) => u.idResetMotDePasse === idReset)
  );

  const tousUtilisateurs = () => Promise.resolve(donnees.utilisateurs);

  const autorisation = (id) => Promise.resolve(
    donnees.autorisations.find((a) => a.id === id)
  );

  const idsServicesCreesParUtilisateur = (idUtilisateur, idsServicesAExclure = []) => (
    Promise.resolve(
      donnees.autorisations
        .filter((as) => (
          as.idUtilisateur === idUtilisateur
          && as.type === 'createur'
          && !idsServicesAExclure.includes(as.idService)))
        .map((a) => a.idService)
    ));

  const autorisationPour = (idUtilisateur, idService) => Promise.resolve(
    donnees.autorisations
      .find((a) => a.idUtilisateur === idUtilisateur && a.idService === idService)
  );

  const ajouteAutorisation = (id, donneesAutorisation) => {
    donnees.autorisations.push(Object.assign(donneesAutorisation, { id }));
    return Promise.resolve();
  };

  const nbAutorisationsCreateur = (idUtilisateur) => Promise.resolve(
    donnees.autorisations
      .filter((a) => a.idUtilisateur === idUtilisateur && a.type === 'createur')
      .length
  );

  const supprimeAutorisation = (idUtilisateur, idHomologation) => {
    donnees.autorisations = donnees.autorisations
      .filter((a) => a.idUtilisateur !== idUtilisateur && a.idHomologation !== idHomologation);
    return Promise.resolve();
  };

  const supprimeAutorisations = () => Promise.resolve(donnees.autorisations = []);

  const supprimeAutorisationsContribution = (idUtilisateur) => {
    donnees.autorisations = donnees.autorisations
      .filter((a) => a.idUtilisateur !== idUtilisateur || a.type !== 'contributeur');
    return Promise.resolve();
  };

  const supprimeAutorisationsService = (idService) => {
    donnees.autorisations = donnees.autorisations
      .filter((a) => a.idService !== idService);
    return Promise.resolve();
  };

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => {
    const autorisationContributionExistante = (idUtilisateur, idHomologation) => (
      !!donnees.autorisations.find(
        (a) => a.idUtilisateur === idUtilisateur
          && a.idHomologation === idHomologation
          && a.type === 'contributeur'
      )
    );

    const supprimeAutorisationsContributionDejaPresentes = () => {
      donnees.autorisations = donnees.autorisations.filter((a) => (
        a.idUtilisateur !== idUtilisateurSource
          || a.type !== 'contributeur'
          || !autorisationContributionExistante(idUtilisateurCible, a.idHomologation)
      ));

      return Promise.resolve();
    };

    const operationTransfert = () => autorisations(idUtilisateurSource)
      .then((as) => as.map((a) => Promise.resolve(a.idUtilisateur = idUtilisateurCible)))
      .then((transferts) => Promise.all(transferts));

    const supprimeDoublonsCreationContribution = (idUtilisateur) => {
      const idsHomologationsCreees = donnees.autorisations
        .filter((a) => a.idUtilisateur === idUtilisateur && a.type === 'createur')
        .map((a) => a.idHomologation);

      donnees.autorisations = donnees.autorisations
        .filter((a) => (
          a.idUtilisateur !== idUtilisateur
          || a.type !== 'contributeur'
          || !idsHomologationsCreees.includes(a.idHomologation)
        ));

      return Promise.resolve();
    };

    return supprimeAutorisationsContributionDejaPresentes(idUtilisateurSource, idUtilisateurCible)
      .then(operationTransfert)
      .then(() => supprimeDoublonsCreationContribution(idUtilisateurCible));
  };

  return {
    ajouteAutorisation,
    ajouteHomologation,
    ajouteService,
    ajouteUtilisateur,
    autorisation,
    autorisationPour,
    autorisations,
    homologation,
    idsServicesCreesParUtilisateur,
    metsAJourHomologation,
    metsAJourService,
    metsAJourUtilisateur,
    nbAutorisationsCreateur,
    service,
    serviceAvecNomService,
    services,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsService,
    supprimeHomologation,
    supprimeHomologations,
    supprimeService,
    supprimeServices,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    transfereAutorisations,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
