import Utilisateur from '../../modeles/utilisateur.js';
import { valeurBooleenne } from '../../utilitaires/aseptisation.js';

const obtentionDonneesDeBaseUtilisateur = (corps, serviceCGU) => {
  const donnees = {
    prenom: corps.prenom,
    nom: corps.nom,
    telephone: corps.telephone,
    entite: {
      siret: corps.siretEntite,
    },
    estimationNombreServices: corps.estimationNombreServices,
    infolettreAcceptee: valeurBooleenne(corps.infolettreAcceptee),
    transactionnelAccepte: valeurBooleenne(corps.transactionnelAccepte),
    postes: corps.postes,
  };
  if (valeurBooleenne(corps.cguAcceptees)) {
    donnees.cguAcceptees = serviceCGU.versionActuelle();
  }
  return donnees;
};

const obtentionDonneesDeBaseUtilisateurBaseeSurBooleens = (
  corps,
  serviceCGU
) => {
  const donnees = {
    prenom: corps.prenom,
    nom: corps.nom,
    telephone: corps.telephone,
    entite: {
      siret: corps.siretEntite,
    },
    estimationNombreServices: corps.estimationNombreServices,
    infolettreAcceptee: corps.infolettreAcceptee,
    transactionnelAccepte: corps.transactionnelAccepte,
    postes: corps.postes,
  };
  if (corps.cguAcceptees) {
    donnees.cguAcceptees = serviceCGU.versionActuelle();
  }
  return donnees;
};

const messageErreurDonneesUtilisateur = (donneesRequete, utilisateurExiste) => {
  try {
    Utilisateur.valideDonnees(donneesRequete, utilisateurExiste);
    return { donneesInvalides: false };
  } catch (erreur) {
    return { donneesInvalides: true, messageErreur: erreur.message };
  }
};

export {
  obtentionDonneesDeBaseUtilisateur,
  obtentionDonneesDeBaseUtilisateurBaseeSurBooleens,
  messageErreurDonneesUtilisateur,
};
