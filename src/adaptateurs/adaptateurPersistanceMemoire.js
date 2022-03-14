const nouvelAdaptateur = (donnees = {}) => {
  donnees.utilisateurs ||= [];
  donnees.homologations ||= [];
  donnees.autorisations ||= [];

  const ajouteHomologation = (id, donneesHomologation) => {
    donnees.homologations.push(Object.assign(donneesHomologation, { id }));
    return Promise.resolve();
  };

  const ajouteUtilisateur = (id, donneesUtilisateur) => {
    donnees.utilisateurs.push(Object.assign(donneesUtilisateur, { id }));
    return Promise.resolve();
  };

  const autorisations = (idUtilisateur) => Promise.resolve(
    donnees.autorisations.filter((a) => a.idUtilisateur === idUtilisateur)
  );

  const homologation = (id) => {
    const intervenantsHomologation = (idHomologation) => donnees.autorisations
      .filter((a) => a.idHomologation === idHomologation)
      .reduce((acc, a) => {
        acc[`${a.type}s`].push(donnees.utilisateurs.find((u) => u.id === a.idUtilisateur));
        return acc;
      }, { createurs: [], contributeurs: [] });

    const homologationTrouvee = donnees.homologations.find((h) => h.id === id);
    if (homologationTrouvee) {
      const intervenants = intervenantsHomologation(id);
      [homologationTrouvee.createur] = intervenants.createurs;
      homologationTrouvee.contributeurs = intervenants.contributeurs;
    }
    return Promise.resolve(homologationTrouvee);
  };

  const homologations = (idUtilisateur) => autorisations(idUtilisateur)
    .then((as) => Promise.all(
      as.map(({ idHomologation }) => homologation(idHomologation))
    ));

  const homologationAvecNomService = (idUtilisateur, nomService, idHomologationMiseAJour) => (
    homologations(idUtilisateur)
      .then((hs) => hs.find((h) => (
        h.id !== idHomologationMiseAJour && h.descriptionService?.nomService === nomService
      )))
  );

  const metsAJourHomologation = (id, donneesAMettreAJour) => homologation(id)
    .then((h) => Object.assign(h, donneesAMettreAJour))
    .then(() => {});

  const supprimeHomologation = (id) => {
    donnees.homologations = donnees.homologations.filter((h) => h.id !== id);
    return Promise.resolve();
  };

  const supprimeHomologations = () => {
    donnees.homologations = [];
    return Promise.resolve();
  };

  const supprimeUtilisateur = (id) => {
    donnees.utilisateurs = donnees.utilisateurs.filter((u) => u.id !== id);
    return Promise.resolve();
  };

  const supprimeUtilisateurs = () => {
    donnees.utilisateurs = [];
    return Promise.resolve();
  };

  const utilisateur = (id) => Promise.resolve(donnees.utilisateurs.find((u) => u.id === id));

  const metsAJourUtilisateur = (id, donneesAMettreAJour) => utilisateur(id)
    .then((u) => Object.assign(u, donneesAMettreAJour))
    .then(() => {});

  const utilisateurAvecEmail = (email) => Promise.resolve(
    donnees.utilisateurs.find((u) => u.email === email)
  );

  const utilisateurAvecIdReset = (idReset) => Promise.resolve(
    donnees.utilisateurs.find((u) => u.idResetMotDePasse === idReset)
  );

  const autorisation = (id) => Promise.resolve(
    donnees.autorisations.find((a) => a.id === id)
  );

  const autorisationPour = (idUtilisateur, idHomologation) => Promise.resolve(
    donnees.autorisations
      .find((a) => a.idUtilisateur === idUtilisateur && a.idHomologation === idHomologation)
  );

  const ajouteAutorisation = (id, donneesAutorisation) => {
    donnees.autorisations.push(Object.assign(donneesAutorisation, { id }));
    return Promise.resolve();
  };

  const supprimeAutorisations = () => Promise.resolve(donnees.autorisations = []);

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => (
    autorisations(idUtilisateurSource)
      .then((as) => as.map((a) => Promise.resolve(a.idUtilisateur = idUtilisateurCible)))
      .then((transferts) => Promise.all(transferts))
  );

  return {
    ajouteAutorisation,
    ajouteHomologation,
    ajouteUtilisateur,
    autorisation,
    autorisationPour,
    autorisations,
    homologation,
    homologationAvecNomService,
    homologations,
    metsAJourHomologation,
    metsAJourUtilisateur,
    supprimeAutorisations,
    supprimeHomologation,
    supprimeHomologations,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    transfereAutorisations,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
