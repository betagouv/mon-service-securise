const nouvelAdaptateur = (donnees = { utilisateurs: [], homologations: [] }) => {
  const ajouteHomologation = (id, donneesHomologation) => new Promise((resolve) => resolve(
    donnees.homologations.push(Object.assign(donneesHomologation, { id }))
  ));

  const ajouteUtilisateur = (id, donneesUtilisateur) => new Promise((resolve) => resolve(
    donnees.utilisateurs.push(Object.assign(donneesUtilisateur, { id }))
  ));

  const homologation = (idHomologation) => new Promise((resolve) => resolve(
    donnees.homologations.find((h) => h.id === idHomologation)
  ));

  const homologations = (idUtilisateur) => new Promise((resolve) => resolve(
    donnees.homologations.filter((h) => h.idUtilisateur === idUtilisateur)
  ));

  const metsAJourHomologation = (id, donneesAMettreAJour) => new Promise((resolve) => resolve(
    homologation(id).then((h) => Object.assign(h, donneesAMettreAJour))
  ));

  const supprimeHomologations = () => new Promise((resolve) => resolve(donnees.homologations = []));
  const supprimeUtilisateurs = () => new Promise((resolve) => resolve(donnees.utilisateurs = []));

  const utilisateur = (id) => new Promise((resolve) => resolve(
    donnees.utilisateurs.find((u) => u.id === id)
  ));

  const metsAJourUtilisateur = (id, donneesAMettreAJour) => new Promise((resolve) => resolve(
    utilisateur(id).then((u) => Object.assign(u, donneesAMettreAJour))
  ));

  const utilisateurAvecEmail = (email) => new Promise((resolve) => resolve(
    donnees.utilisateurs.find((u) => u.email === email)
  ));

  const utilisateurAvecIdReset = (idReset) => new Promise((resolve) => resolve(
    donnees.utilisateurs.find((u) => u.idResetMotDePasse === idReset)
  ));

  return {
    ajouteHomologation,
    ajouteUtilisateur,
    homologation,
    homologations,
    metsAJourHomologation,
    metsAJourUtilisateur,
    supprimeHomologations,
    supprimeUtilisateurs,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
