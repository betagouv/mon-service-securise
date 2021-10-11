const nouvelAdaptateur = (donnees = { utilisateurs: [], homologations: [] }) => {
  const ajouteHomologation = (id, donneesHomologation) => {
    donnees.homologations.push(Object.assign(donneesHomologation, { id }));
    return Promise.resolve();
  };

  const ajouteUtilisateur = (id, donneesUtilisateur) => {
    donnees.utilisateurs.push(Object.assign(donneesUtilisateur, { id }));
    return Promise.resolve();
  };

  const homologation = (idHomologation) => Promise.resolve(
    donnees.homologations.find((h) => h.id === idHomologation)
  );

  const homologations = (idUtilisateur) => Promise.resolve(
    donnees.homologations.filter((h) => h.idUtilisateur === idUtilisateur)
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

  return {
    ajouteHomologation,
    ajouteUtilisateur,
    homologation,
    homologations,
    metsAJourHomologation,
    metsAJourUtilisateur,
    supprimeHomologation,
    supprimeHomologations,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
