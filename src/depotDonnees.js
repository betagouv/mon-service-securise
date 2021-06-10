const bcrypt = require('bcrypt');

const Homologation = require('./modeles/homologation');
const Utilisateur = require('./modeles/utilisateur');

const creeDepot = (donnees, adaptateurJWT, adaptateurUUID) => {
  const homologation = (idHomologation) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    return donneesHomologation ? new Homologation(donneesHomologation) : undefined;
  };

  const homologations = (idUtilisateur) => donnees.homologations
    .filter((h) => h.idUtilisateur === idUtilisateur)
    .map((h) => new Homologation(h));

  const nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
    donneesHomologation.id = adaptateurUUID.genereUUID();
    donneesHomologation.idUtilisateur = idUtilisateur;
    donnees.homologations.push(donneesHomologation);

    return donneesHomologation.id;
  };

  const utilisateur = (identifiant) => {
    const donneesUtilisateur = donnees.utilisateurs.find((u) => u.id === identifiant);
    return new Utilisateur(donneesUtilisateur, adaptateurJWT);
  };

  const utilisateurAuthentifie = (login, motDePasse) => {
    const donneesUtilisateur = donnees.utilisateurs.find((u) => u.email === login);
    const motDePasseStocke = donneesUtilisateur && donneesUtilisateur.motDePasse;
    const echecAuthentification = undefined;

    if (!motDePasseStocke) return new Promise((resolve) => resolve(echecAuthentification));

    return bcrypt.compare(motDePasse, motDePasseStocke)
      .then((authentificationReussie) => (authentificationReussie
        ? new Utilisateur(donneesUtilisateur, adaptateurJWT)
        : echecAuthentification
      ))
      .catch((error) => error);
  };

  return {
    homologation, homologations, nouvelleHomologation, utilisateur, utilisateurAuthentifie,
  };
};

const creeDepotVide = () => creeDepot({ utilisateurs: [], homologations: [] });

module.exports = { creeDepot, creeDepotVide };
