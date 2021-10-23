const bcrypt = require('bcrypt');

const {
  ErreurEmailManquant,
  ErreurNomServiceManquant,
  ErreurUtilisateurExistant,
} = require('./erreurs');
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

  const remplaceProprieteHomologation = (nomPropriete, idHomologation, propriete) => (
    adaptateurPersistance.homologation(idHomologation)
      .then((h) => {
        const donneesPropriete = propriete.toJSON();
        h[nomPropriete] = donneesPropriete;

        const { id, ...donnees } = h;
        return adaptateurPersistance.metsAJourHomologation(id, donnees);
      })
  );

  const ajouteMesureGeneraleAHomologation = (...params) => (
    ajouteAItemsDansHomologation('mesuresGenerales', ...params)
  );

  const ajouteRisqueGeneralAHomologation = (...params) => (
    ajouteAItemsDansHomologation('risquesGeneraux', ...params)
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

  const remplaceRisquesSpecifiquesPourHomologation = (...params) => (
    remplaceProprieteHomologation('risquesSpecifiques', ...params)
  );

  const utilisateur = (identifiant) => adaptateurPersistance.utilisateur(identifiant)
    .then((u) => (u ? new Utilisateur(u, adaptateurJWT) : undefined));

  const nouvelUtilisateur = (donneesUtilisateur) => new Promise((resolve, reject) => {
    const { email } = donneesUtilisateur;
    if (!email) throw new ErreurEmailManquant();

    adaptateurPersistance.utilisateurAvecEmail(donneesUtilisateur.email)
      .then((u) => {
        if (u) return reject(new ErreurUtilisateurExistant());

        const id = adaptateurUUID.genereUUID();
        donneesUtilisateur.idResetMotDePasse = adaptateurUUID.genereUUID();
        return bcrypt.hash(adaptateurUUID.genereUUID(), 10)
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

  const reinitialiseMotDePasse = (email) => adaptateurPersistance.utilisateurAvecEmail(email)
    .then((u) => {
      if (!u) return undefined;

      const idResetMotDePasse = adaptateurUUID.genereUUID();
      return adaptateurPersistance.metsAJourUtilisateur(u.id, { idResetMotDePasse })
        .then(() => utilisateur(u.id));
    });

  const { supprimeHomologation } = adaptateurPersistance;

  const supprimeIdResetMotDePassePourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(
      utilisateurAModifier.id, { idResetMotDePasse: undefined }
    )
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  const supprimeUtilisateur = (id) => homologations(id)
    .then((hs) => hs.map((h) => adaptateurPersistance.supprimeHomologation(h.id)))
    .then((suppressions) => Promise.all(suppressions))
    .then(() => adaptateurPersistance.supprimeUtilisateur(id));

  const valideAcceptationCGUPourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(utilisateurAModifier.id, { cguAcceptees: true })
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  return {
    ajouteAvisExpertCyberAHomologation,
    ajouteCaracteristiquesAHomologation,
    ajouteInformationsGeneralesAHomologation,
    ajouteMesureGeneraleAHomologation,
    ajoutePartiesPrenantesAHomologation,
    ajouteRisqueGeneralAHomologation,
    homologation,
    homologations,
    marqueRisquesCommeVerifies,
    metsAJourMotDePasse,
    nouvelleHomologation,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceRisquesSpecifiquesPourHomologation,
    supprimeHomologation,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
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
