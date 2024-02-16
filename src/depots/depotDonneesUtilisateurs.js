const adaptateurJWTParDefaut = require('../adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurEmailManquant,
  ErreurSuppressionImpossible,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurMotDePasseIncorrect,
} = require('../erreurs');
const EvenementNouvelUtilisateurInscrit = require('../modeles/journalMSS/evenementNouvelUtilisateurInscrit');
const EvenementProfilUtilisateurModifie = require('../modeles/journalMSS/evenementProfilUtilisateurModifie');
const Utilisateur = require('../modeles/utilisateur');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurJournalMSS,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
  } = config;

  const utilisateur = async (identifiant) => {
    const u = await adaptateurPersistance.utilisateur(identifiant);
    return u ? new Utilisateur(u, { adaptateurJWT }) : undefined;
  };

  const nouvelUtilisateur = async (donneesUtilisateur) => {
    const { email } = donneesUtilisateur;
    if (!email)
      throw new ErreurEmailManquant('Le champ email doit être renseigné');

    const u = await adaptateurPersistance.utilisateurAvecEmail(email);
    if (u)
      throw new ErreurUtilisateurExistant(
        'Utilisateur déjà existant pour cette adresse email',
        u.id
      );

    const id = adaptateurUUID.genereUUID();
    donneesUtilisateur.idResetMotDePasse = adaptateurUUID.genereUUID();
    donneesUtilisateur.motDePasse = await adaptateurChiffrement.hacheBCrypt(
      adaptateurUUID.genereUUID()
    );
    donneesUtilisateur.transactionnelAccepte = true;

    await adaptateurPersistance.ajouteUtilisateur(id, donneesUtilisateur);

    await adaptateurJournalMSS.consigneEvenement(
      new EvenementNouvelUtilisateurInscrit({
        idUtilisateur: id,
      }).toJSON()
    );

    await adaptateurJournalMSS.consigneEvenement(
      new EvenementProfilUtilisateurModifie({
        idUtilisateur: id,
        ...donneesUtilisateur,
      }).toJSON()
    );

    return utilisateur(id);
  };

  const utilisateurAFinaliser = async (idReset) => {
    const u = await adaptateurPersistance.utilisateurAvecIdReset(idReset);
    return u ? new Utilisateur(u, { adaptateurJWT }) : undefined;
  };

  const utilisateurAuthentifie = async (login, motDePasse) => {
    const u = await adaptateurPersistance.utilisateurAvecEmail(login);

    const motDePasseStocke = u && u.motDePasse;
    const echecAuthentification = undefined;

    if (!motDePasseStocke) return echecAuthentification;

    const authentificationReussie = await adaptateurChiffrement.compareBCrypt(
      motDePasse,
      motDePasseStocke
    );

    return authentificationReussie
      ? new Utilisateur(u, { adaptateurJWT })
      : echecAuthentification;
  };

  const utilisateurExiste = async (id) => {
    const u = await utilisateur(id);
    return !!u;
  };

  const { utilisateurAvecEmail } = adaptateurPersistance;

  const metsAJourMotDePasse = async (idUtilisateur, motDePasse) => {
    const hash = await adaptateurChiffrement.hacheBCrypt(motDePasse);
    await adaptateurPersistance.metsAJourUtilisateur(idUtilisateur, {
      motDePasse: hash,
    });
    return utilisateur(idUtilisateur);
  };

  const metsAJourUtilisateur = async (id, donnees) => {
    delete donnees.motDePasse;
    await adaptateurPersistance.metsAJourUtilisateur(id, donnees);
    await adaptateurJournalMSS.consigneEvenement(
      new EvenementProfilUtilisateurModifie({
        idUtilisateur: id,
        ...donnees,
      }).toJSON()
    );
    return utilisateur(id);
  };

  const reinitialiseMotDePasse = async (email) => {
    const u = await adaptateurPersistance.utilisateurAvecEmail(email);
    if (!u) return undefined;

    const idResetMotDePasse = adaptateurUUID.genereUUID();
    await adaptateurPersistance.metsAJourUtilisateur(u.id, {
      idResetMotDePasse,
    });
    return utilisateur(u.id);
  };

  const supprimeIdResetMotDePassePourUtilisateur = (utilisateurAModifier) =>
    adaptateurPersistance
      .metsAJourUtilisateur(utilisateurAModifier.id, {
        idResetMotDePasse: undefined,
      })
      .then(() => utilisateur(utilisateurAModifier.id));

  const supprimeUtilisateur = async (id) => {
    const verifieUtilisateurExistant = async () => {
      const u = await adaptateurPersistance.utilisateur(id);
      if (typeof u === 'undefined')
        throw new ErreurUtilisateurInexistant(
          `L'utilisateur "${id}" n'existe pas`
        );
    };

    const verifieUtilisateurPasProprietaire = async () => {
      const nb = await adaptateurPersistance.nbAutorisationsProprietaire(id);
      if (nb > 0)
        throw new ErreurSuppressionImpossible(
          `Suppression impossible : l'utilisateur "${id}" a créé des services`
        );
    };

    await verifieUtilisateurExistant();
    await verifieUtilisateurPasProprietaire();
    await adaptateurPersistance.supprimeAutorisationsContribution(id);
    await adaptateurPersistance.supprimeUtilisateur(id);
  };

  const tousUtilisateurs = () =>
    adaptateurPersistance
      .tousUtilisateurs()
      .then((tous) => tous.map((u) => new Utilisateur(u, { adaptateurJWT })));

  const valideAcceptationCGUPourUtilisateur = (utilisateurAModifier) =>
    adaptateurPersistance
      .metsAJourUtilisateur(utilisateurAModifier.id, { cguAcceptees: true })
      .then(() => utilisateur(utilisateurAModifier.id));

  const verifieMotDePasse = async (idUtilisateur, motDePasse) => {
    const erreurMotDePasseIncorrect = new ErreurMotDePasseIncorrect(
      'Le mot de passe est incorrect'
    );
    const u = await adaptateurPersistance.utilisateur(idUtilisateur);

    const motDePasseStocke = u && u.motDePasse;

    if (!motDePasseStocke) throw erreurMotDePasseIncorrect;

    const authentificationReussie = await adaptateurChiffrement.compareBCrypt(
      motDePasse,
      motDePasseStocke
    );

    if (!authentificationReussie) throw erreurMotDePasseIncorrect;
  };

  return {
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    tousUtilisateurs,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
    verifieMotDePasse,
  };
};

module.exports = { creeDepot };
