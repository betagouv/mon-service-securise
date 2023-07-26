const Utilisateur = require('../../modeles/utilisateur');
const { valeurBooleenne } = require('../../utilitaires/aseptisation');

const obtentionDonneesDeBaseUtilisateur = (corps) => ({
  prenom: corps.prenom,
  nom: corps.nom,
  telephone: corps.telephone,
  nomEntitePublique: corps.nomEntitePublique,
  departementEntitePublique: corps.departementEntitePublique,
  infolettreAcceptee: valeurBooleenne(corps.infolettreAcceptee),
  transactionnelAccepte: valeurBooleenne(corps.transactionnelAccepte),
  postes: corps.postes,
});

const messageErreurDonneesUtilisateur = (
  donneesRequete,
  utilisateurExiste,
  referentiel
) => {
  try {
    Utilisateur.valideDonnees(donneesRequete, referentiel, utilisateurExiste);
    return { donneesInvalides: false };
  } catch (erreur) {
    return { donneesInvalides: true, messageErreur: erreur.message };
  }
};

module.exports = {
  obtentionDonneesDeBaseUtilisateur,
  messageErreurDonneesUtilisateur,
};
