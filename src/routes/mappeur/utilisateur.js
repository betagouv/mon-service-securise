const Utilisateur = require('../../modeles/utilisateur');
const { valeurBooleenne } = require('../../utilitaires/aseptisation');

const obtentionDonneesDeBaseUtilisateur = (corps) => ({
  prenom: corps.prenom,
  nom: corps.nom,
  telephone: corps.telephone,
  entite: {
    siret: corps.siretEntite,
  },
  infolettreAcceptee: valeurBooleenne(corps.infolettreAcceptee),
  transactionnelAccepte: valeurBooleenne(corps.transactionnelAccepte),
  postes: corps.postes,
});

const messageErreurDonneesUtilisateur = (donneesRequete, utilisateurExiste) => {
  try {
    Utilisateur.valideDonnees(donneesRequete, utilisateurExiste);
    return { donneesInvalides: false };
  } catch (erreur) {
    return { donneesInvalides: true, messageErreur: erreur.message };
  }
};

module.exports = {
  obtentionDonneesDeBaseUtilisateur,
  messageErreurDonneesUtilisateur,
};
