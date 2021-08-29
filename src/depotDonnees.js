const bcrypt = require('bcrypt');

const { ErreurNomServiceManquant, ErreurUtilisateurExistant } = require('./erreurs');
const AdaptateurPersistanceMemoire = require('./adaptateurs/adaptateurPersistanceMemoire');
const Homologation = require('./modeles/homologation');
const Utilisateur = require('./modeles/utilisateur');

const creeDepot = (config = {}) => {
  const {
    adaptateurJWT,
    adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(),
    adaptateurUUID,
    referentiel,
  } = config;

  const homologation = (idHomologation) => adaptateurPersistance.homologation(idHomologation)
    .then((h) => (h ? new Homologation(h, referentiel) : undefined));

  const ajouteAItemsDansHomologation = (nomListeItems, idHomologation, item) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((h) => {
        h[nomListeItems] ||= [];

        const donneesItem = item.toJSON();
        const itemDejaDansDepot = h[nomListeItems].find((i) => i.id === donneesItem.id);
        if (itemDejaDansDepot) {
          Object.assign(itemDejaDansDepot, donneesItem);
        } else {
          h[nomListeItems].push(donneesItem);
        }

        const { id, ...donnees } = h;
        return adaptateurPersistance.metsAJourHomologation(id, donnees);
      })
  );

  const metsAJourProprieteHomologation = (nomPropriete, idHomologation, propriete) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((h) => {
        h[nomPropriete] ||= {};

        const donneesPropriete = propriete.toJSON();
        Object.assign(h[nomPropriete], donneesPropriete);

        const { id, ...donnees } = h;
        return adaptateurPersistance.metsAJourHomologation(id, donnees);
      })
  );

  const ajouteMesureAHomologation = (...params) => (
    ajouteAItemsDansHomologation('mesures', ...params)
  );

  const ajouteRisqueAHomologation = (...params) => (
    ajouteAItemsDansHomologation('risques', ...params)
  );

  const valideInformationsGenerales = (infos) => new Promise((resolve, reject) => {
    const { nomService } = infos;
    if (typeof nomService !== 'string' || !nomService) {
      reject(new ErreurNomServiceManquant('Le nom du service ne peut pas être vide'));
    }

    resolve();
  });

  const ajouteInformationsGeneralesAHomologation = (idHomologation, infos) => (
    valideInformationsGenerales(infos)
      .then(() => metsAJourProprieteHomologation('informationsGenerales', idHomologation, infos))
  );

  const ajouteCaracteristiquesAHomologation = (...params) => (
    metsAJourProprieteHomologation('caracteristiquesComplementaires', ...params)
  );

  const ajoutePartiesPrenantesAHomologation = (...params) => (
    metsAJourProprieteHomologation('partiesPrenantes', ...params)
  );

  const ajouteAvisExpertCyberAHomologation = (...params) => (
    metsAJourProprieteHomologation('avisExpertCyber', ...params)
  );

  const marqueRisquesCommeVerifies = (idHomologation) => (
    adaptateurPersistance.metsAJourHomologation(idHomologation, { risquesVerifies: true })
  );

  const homologations = (idUtilisateur) => adaptateurPersistance.homologations(idUtilisateur)
    .then((hs) => hs.map((h) => new Homologation(h, referentiel)));

  const nouvelleHomologation = (idUtilisateur, donneesInformationsGenerales) => (
    valideInformationsGenerales(donneesInformationsGenerales)
      .then(() => {
        const id = adaptateurUUID.genereUUID();
        const donnees = { idUtilisateur, informationsGenerales: donneesInformationsGenerales };

        return adaptateurPersistance.ajouteHomologation(id, donnees)
          .then(() => id);
      })
  );

  const utilisateur = (identifiant) => adaptateurPersistance.utilisateur(identifiant)
    .then((u) => (u ? new Utilisateur(u, adaptateurJWT) : undefined));

  const nouvelUtilisateur = (donneesUtilisateur) => new Promise((resolve, reject) => {
    adaptateurPersistance.utilisateurAvecEmail(donneesUtilisateur.email)
      .then((u) => {
        if (u) reject(new ErreurUtilisateurExistant());

        const id = adaptateurUUID.genereUUID();
        donneesUtilisateur.idResetMotDePasse = adaptateurUUID.genereUUID();
        bcrypt.hash(adaptateurUUID.genereUUID(), 10)
          .then((hash) => {
            donneesUtilisateur.motDePasse = hash;

            adaptateurPersistance.ajouteUtilisateur(id, donneesUtilisateur)
              .then(() => resolve(utilisateur(id)));
          });
      });
  });

  const utilisateurAFinaliser = (idReset) => adaptateurPersistance.utilisateurAvecIdReset(idReset)
    .then((u) => (u ? new Utilisateur(u, adaptateurJWT) : undefined));

  const utilisateurAuthentifie = (login, motDePasse) => (
    adaptateurPersistance.utilisateurAvecEmail(login)
      .then((u) => {
        const motDePasseStocke = u && u.motDePasse;
        const echecAuthentification = undefined;

        if (!motDePasseStocke) return new Promise((resolve) => resolve(echecAuthentification));

        return bcrypt.compare(motDePasse, motDePasseStocke)
          .then((authentificationReussie) => (authentificationReussie
            ? new Utilisateur(u, adaptateurJWT)
            : echecAuthentification
          ));
      })
  );

  const utilisateurExiste = (id) => utilisateur(id).then((u) => !!u);

  const metsAJourMotDePasse = (idUtilisateur, motDePasse) => (
    bcrypt.hash(motDePasse, 10)
      .then((hash) => adaptateurPersistance.metsAJourUtilisateur(
        idUtilisateur, { motDePasse: hash }
      ))
      .then(() => utilisateur(idUtilisateur))
  );

  const supprimeIdResetMotDePassePourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(
      utilisateurAModifier.id, { idResetMotDePasse: undefined }
    )
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  const valideAcceptationCGUPourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(utilisateurAModifier.id, { cguAcceptees: true })
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  return {
    ajouteAvisExpertCyberAHomologation,
    ajouteCaracteristiquesAHomologation,
    ajouteInformationsGeneralesAHomologation,
    ajouteMesureAHomologation,
    ajoutePartiesPrenantesAHomologation,
    ajouteRisqueAHomologation,
    homologation,
    homologations,
    marqueRisquesCommeVerifies,
    metsAJourMotDePasse,
    nouvelleHomologation,
    nouvelUtilisateur,
    supprimeIdResetMotDePassePourUtilisateur,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    valideAcceptationCGUPourUtilisateur,
  };
};

const creeDepotVide = () => {
  const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur();
  return adaptateurPersistance.supprimeUtilisateurs()
    .then(() => adaptateurPersistance.supprimeHomologations())
    .then(() => creeDepot({ adaptateurPersistance }));
};

module.exports = { creeDepot, creeDepotVide };
