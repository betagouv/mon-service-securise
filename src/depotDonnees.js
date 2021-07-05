const bcrypt = require('bcrypt');

const { ErreurUtilisateurExistant } = require('./erreurs');
const Homologation = require('./modeles/homologation');
const Utilisateur = require('./modeles/utilisateur');

const creeDepot = (donnees, { adaptateurJWT, adaptateurUUID, referentiel } = {}) => {
  const homologation = (idHomologation) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    return donneesHomologation ? new Homologation(donneesHomologation, referentiel) : undefined;
  };

  const ajouteMesureAHomologation = (idHomologation, mesure) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    donneesHomologation.mesures ||= [];

    const donneesMesure = mesure.toJSON();
    const mesureDejaDansDepot = donneesHomologation.mesures.find((m) => m.id === mesure.id);
    if (mesureDejaDansDepot) {
      Object.keys(donneesMesure)
        .filter((k) => k !== 'id')
        .forEach((k) => (mesureDejaDansDepot[k] = donneesMesure[k]));
    } else {
      donneesHomologation.mesures.push(donneesMesure);
    }
  };

  const ajouteCaracteristiquesAHomologation = (idHomologation, caracteristiques) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    donneesHomologation.caracteristiquesComplementaires ||= {};

    const donneesCaracteristiques = caracteristiques.toJSON();
    Object.keys(donneesCaracteristiques).forEach((k) => (
      donneesHomologation.caracteristiquesComplementaires[k] = donneesCaracteristiques[k]
    ));
  };

  const ajoutePartiesPrenantesAHomologation = (idHomologation, partiesPrenantes) => {
    const donneesHomologation = donnees.homologations.find((h) => h.id === idHomologation);
    donneesHomologation.partiesPrenantes ||= {};

    const donneesPartiesPrenantes = partiesPrenantes.toJSON();
    Object.keys(donneesPartiesPrenantes).forEach((k) => (
      donneesHomologation.partiesPrenantes[k] = donneesPartiesPrenantes[k]
    ));
  };

  const homologations = (idUtilisateur) => donnees.homologations
    .filter((h) => h.idUtilisateur === idUtilisateur)
    .map((h) => new Homologation(h, referentiel));

  const metsAJourHomologation = (identifiant, donneesHomologation) => {
    const donneesPersistees = donnees.homologations.find((h) => h.id === identifiant);
    Object.keys(donneesHomologation).forEach((clef) => {
      if (donneesHomologation[clef]) donneesPersistees[clef] = donneesHomologation[clef];
    });

    return donneesPersistees.id;
  };

  const nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
    donneesHomologation.id = adaptateurUUID.genereUUID();
    donneesHomologation.idUtilisateur = idUtilisateur;
    donnees.homologations.push(donneesHomologation);

    return donneesHomologation.id;
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
    ajouteCaracteristiquesAHomologation,
    ajouteMesureAHomologation,
    ajoutePartiesPrenantesAHomologation,
    homologation,
    homologations,
    metsAJourHomologation,
    nouvelleHomologation,
    nouvelUtilisateur,
    utilisateur,
    utilisateurAuthentifie,
  };
};

const creeDepotVide = () => creeDepot({ utilisateurs: [], homologations: [] });

module.exports = { creeDepot, creeDepotVide };
