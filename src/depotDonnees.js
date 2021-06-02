const bcrypt = require('bcrypt');

const Homologation = require('./modeles/homologation');
const Utilisateur = require('./modeles/utilisateur');

const creeDepot = (donnees, adaptateurJWT) => {
  const homologations = (idUtilisateur) => donnees.homologations
    .filter((h) => h.idUtilisateur === idUtilisateur)
    .map((h) => new Homologation(h));

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

  return { homologations, utilisateur, utilisateurAuthentifie };
};

const creeDepotVide = () => creeDepot({ utilisateurs: [], homologations: [] });

module.exports = { creeDepot, creeDepotVide };
