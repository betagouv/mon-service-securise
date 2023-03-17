const adaptateurChiffrementParDefaut = require('../adaptateurs/adaptateurChiffrement');
const adaptateurJWTParDefaut = require('../adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurEmailManquant,
  ErreurSuppressionImpossible,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
} = require('../erreurs');
const EvenementProfilUtilisateurModifie = require('../modeles/journalMSS/evenementProfilUtilisateurModifie');
const Utilisateur = require('../modeles/utilisateur');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement = adaptateurChiffrementParDefaut,
    adaptateurJournalMSS,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
  } = config;

  const utilisateur = (identifiant) => adaptateurPersistance.utilisateur(identifiant)
    .then((u) => (u ? new Utilisateur(u, { adaptateurJWT }) : undefined));

  const nouvelUtilisateur = (donneesUtilisateur) => new Promise((resolve, reject) => {
    const { email } = donneesUtilisateur;
    if (!email) throw new ErreurEmailManquant('Le champ email doit être renseigné');

    adaptateurPersistance.utilisateurAvecEmail(email)
      .then((u) => {
        if (u) {
          return reject(
            new ErreurUtilisateurExistant('Utilisateur déjà existant pour cette adresse email', u.id)
          );
        }

        const id = adaptateurUUID.genereUUID();
        donneesUtilisateur.idResetMotDePasse = adaptateurUUID.genereUUID();
        return adaptateurChiffrement.chiffre(adaptateurUUID.genereUUID())
          .then((hash) => {
            donneesUtilisateur.motDePasse = hash;

            adaptateurPersistance.ajouteUtilisateur(id, donneesUtilisateur)
              .then(() => adaptateurJournalMSS.consigneEvenement(
                new EvenementProfilUtilisateurModifie(
                  { idUtilisateur: id, ...donneesUtilisateur }
                ).toJSON()
              ).then(() => resolve(utilisateur(id))));
          });
      });
  });

  const utilisateurAFinaliser = (idReset) => adaptateurPersistance.utilisateurAvecIdReset(idReset)
    .then((u) => (u ? new Utilisateur(u, { adaptateurJWT }) : undefined));

  const utilisateurAuthentifie = (login, motDePasse) => (
    adaptateurPersistance.utilisateurAvecEmail(login)
      .then((u) => {
        const motDePasseStocke = u && u.motDePasse;
        const echecAuthentification = undefined;

        if (!motDePasseStocke) return Promise.resolve(echecAuthentification);

        return adaptateurChiffrement.compare(motDePasse, motDePasseStocke)
          .then((authentificationReussie) => (authentificationReussie
            ? new Utilisateur(u, { adaptateurJWT })
            : echecAuthentification
          ));
      })
  );

  const utilisateurExiste = (id) => utilisateur(id).then((u) => !!u);

  const { utilisateurAvecEmail } = adaptateurPersistance;

  const metsAJourMotDePasse = (idUtilisateur, motDePasse) => (
    adaptateurChiffrement.chiffre(motDePasse)
      .then((hash) => adaptateurPersistance.metsAJourUtilisateur(
        idUtilisateur, { motDePasse: hash }
      ))
      .then(() => utilisateur(idUtilisateur))
  );

  const metsAJourUtilisateur = (id, donnees) => {
    delete donnees.motDePasse;
    return adaptateurPersistance.metsAJourUtilisateur(id, donnees)
      .then(() => utilisateur(id));
  };

  const reinitialiseMotDePasse = (email) => adaptateurPersistance.utilisateurAvecEmail(email)
    .then((u) => {
      if (!u) return undefined;

      const idResetMotDePasse = adaptateurUUID.genereUUID();
      return adaptateurPersistance.metsAJourUtilisateur(u.id, { idResetMotDePasse })
        .then(() => utilisateur(u.id));
    });

  const supprimeIdResetMotDePassePourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(
      utilisateurAModifier.id, { idResetMotDePasse: undefined }
    )
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  const supprimeUtilisateur = (...params) => {
    const verifieUtilisateurExistant = (id) => adaptateurPersistance.utilisateur(id)
      .then((u) => {
        if (typeof u === 'undefined') {
          throw new ErreurUtilisateurInexistant(`L'utilisateur "${id}" n'existe pas`);
        }
      });

    const verifieUtilisateurPasCreateur = (id) => adaptateurPersistance.nbAutorisationsCreateur(id)
      .then((nb) => {
        if (nb > 0) {
          throw new ErreurSuppressionImpossible(`Suppression impossible : l'utilisateur "${id}" a créé des services`);
        }
      });

    return verifieUtilisateurExistant(...params)
      .then(() => verifieUtilisateurPasCreateur(...params))
      .then(() => adaptateurPersistance.supprimeAutorisationsContribution(...params))
      .then(() => adaptateurPersistance.supprimeUtilisateur(...params));
  };

  const valideAcceptationCGUPourUtilisateur = (utilisateurAModifier) => (
    adaptateurPersistance.metsAJourUtilisateur(utilisateurAModifier.id, { cguAcceptees: true })
      .then(() => utilisateur(utilisateurAModifier.id))
  );

  return {
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
  };
};

module.exports = { creeDepot };
