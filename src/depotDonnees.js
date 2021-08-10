const bcrypt = require('bcrypt');

const { ErreurUtilisateurExistant } = require('./erreurs');
const Homologation = require('./modeles/homologation');
const Utilisateur = require('./modeles/utilisateur');

const creeDepot = (donnees, { adaptateurJWT, adaptateurUUID, referentiel } = {}) => {
  const homologation = (idHomologation) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    return donneesHomologation ? new Homologation(donneesHomologation, referentiel) : undefined;
  };

  const ajouteAItemsDansHomologation = (nomListeItems, idHomologation, item) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    donneesHomologation[nomListeItems] ||= [];

    const donneesItem = item.toJSON();
    const itemDejaDansDepot = donneesHomologation[nomListeItems].find((m) => m.id === item.id);
    if (itemDejaDansDepot) {
      Object.keys(donneesItem)
        .filter((k) => k !== 'id')
        .forEach((k) => (itemDejaDansDepot[k] = donneesItem[k]));
    } else {
      donneesHomologation[nomListeItems].push(donneesItem);
    }
  };

  const metsAJourProprieteHomologation = (nomPropriete, idHomologation, propriete) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    donneesHomologation[nomPropriete] ||= {};

    const donneesPropriete = propriete.toJSON();
    Object.keys(donneesPropriete).forEach((k) => (
      donneesHomologation[nomPropriete][k] = donneesPropriete[k]
    ));
  };

  const ajouteMesureAHomologation = (...params) => {
    ajouteAItemsDansHomologation('mesures', ...params);
  };

  const ajouteRisqueAHomologation = (...params) => {
    ajouteAItemsDansHomologation('risques', ...params);
  };

  const ajouteCaracteristiquesAHomologation = (...params) => {
    metsAJourProprieteHomologation('caracteristiquesComplementaires', ...params);
  };

  const ajoutePartiesPrenantesAHomologation = (...params) => {
    metsAJourProprieteHomologation('partiesPrenantes', ...params);
  };

  const ajouteAvisExpertCyberAHomologation = (...params) => {
    metsAJourProprieteHomologation('avisExpertCyber', ...params);
  };

  const homologations = (idUtilisateur) => donnees.homologations
    .filter((h) => h.idUtilisateur === idUtilisateur)
    .map((h) => new Homologation(h, referentiel));

  const metsAJourHomologation = (identifiant, donneesHomologation) => {
    const donneesPersistees = donnees.homologations.find((h) => h.id === identifiant);
    Object.keys(donneesHomologation)
      .filter((k) => typeof k !== 'undefined')
      .forEach((k) => (donneesPersistees[k] = donneesHomologation[k]));

    return donneesPersistees.id;
  };

  const nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
    donneesHomologation.id = adaptateurUUID.genereUUID();
    donneesHomologation.idUtilisateur = idUtilisateur;
    donnees.homologations.push(donneesHomologation);

    return donneesHomologation.id;
  };

  const metsAJourMotDePasse = (idUtilisateur, motDePasse) => {
    const donneesUtilisateur = donnees.utilisateurs.find((u) => u.id === idUtilisateur);
    return bcrypt.hash(motDePasse, 10)
      .then((hash) => {
        donneesUtilisateur.motDePasse = hash;
        return new Utilisateur(donneesUtilisateur, adaptateurJWT);
      });
  };

  const nouvelUtilisateur = (donneesUtilisateur) => {
    const utilisateurExiste = (email) => !!(donnees.utilisateurs.find((u) => u.email === email));

    if (utilisateurExiste(donneesUtilisateur.email)) throw new ErreurUtilisateurExistant();

    donneesUtilisateur.id = adaptateurUUID.genereUUID();
    return bcrypt.hash(donneesUtilisateur.motDePasse, 10)
      .then((hash) => {
        donneesUtilisateur.motDePasse = hash;
        donnees.utilisateurs.push(donneesUtilisateur);
        return new Utilisateur(donneesUtilisateur, adaptateurJWT);
      });
  };

  const utilisateur = (identifiant) => {
    const donneesUtilisateur = donnees.utilisateurs.find((u) => u.id === identifiant);
    return donneesUtilisateur ? new Utilisateur(donneesUtilisateur, adaptateurJWT) : undefined;
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
    ajouteAvisExpertCyberAHomologation,
    ajouteCaracteristiquesAHomologation,
    ajouteMesureAHomologation,
    ajoutePartiesPrenantesAHomologation,
    ajouteRisqueAHomologation,
    homologation,
    homologations,
    metsAJourHomologation,
    metsAJourMotDePasse,
    nouvelleHomologation,
    nouvelUtilisateur,
    utilisateur,
    utilisateurAuthentifie,
  };
};

const creeDepotVide = () => creeDepot({ utilisateurs: [], homologations: [] });

module.exports = { creeDepot, creeDepotVide };
