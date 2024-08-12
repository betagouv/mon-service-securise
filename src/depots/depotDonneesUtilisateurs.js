const adaptateurJWTParDefaut = require('../adaptateurs/adaptateurJWT');
const { fabriqueAdaptateurUUID } = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurEmailManquant,
  ErreurSuppressionImpossible,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurMotDePasseIncorrect,
} = require('../erreurs');
const Utilisateur = require('../modeles/utilisateur');
const Entite = require('../modeles/entite');
const EvenementUtilisateurModifie = require('../bus/evenementUtilisateurModifie');
const EvenementUtilisateurInscrit = require('../bus/evenementUtilisateurInscrit');

function fabriquePersistance({ adaptateurPersistance, adaptateurJWT }) {
  return {
    lis: {
      un: async (idUtilisateur) => {
        const u = await adaptateurPersistance.utilisateur(idUtilisateur);
        return u ? new Utilisateur(u, { adaptateurJWT }) : undefined;
      },
      celuiAvecEmail: async (email) =>
        adaptateurPersistance.utilisateurAvecEmail(email),
      celuiAvecIdReset: async (idReset) => {
        const u = await adaptateurPersistance.utilisateurAvecIdReset(idReset);
        return u ? new Utilisateur(u, { adaptateurJWT }) : undefined;
      },
    },
    ajoute: async (id, donneesUtilisateur) =>
      adaptateurPersistance.ajouteUtilisateur(id, donneesUtilisateur),
  };
}

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    adaptateurRechercheEntite,
    busEvenements,
  } = config;

  const p = fabriquePersistance({ adaptateurPersistance, adaptateurJWT });

  const utilisateur = async (identifiant) => p.lis.un(identifiant);

  const nouvelUtilisateur = async (donneesUtilisateur) => {
    const { email } = donneesUtilisateur;
    if (!email)
      throw new ErreurEmailManquant('Le champ email doit être renseigné');

    let u = await p.lis.celuiAvecEmail(email);
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
    if (donneesUtilisateur.entite) {
      donneesUtilisateur.entite = await Entite.completeDonnees(
        donneesUtilisateur.entite,
        adaptateurRechercheEntite
      );
    }

    await p.ajoute(id, donneesUtilisateur);
    u = await p.lis.un(id);

    await busEvenements.publie(
      new EvenementUtilisateurInscrit({ utilisateur: u })
    );

    return u;
  };

  const utilisateurAFinaliser = async (idReset) =>
    p.lis.celuiAvecIdReset(idReset);

  const utilisateurAuthentifie = async (login, motDePasse) => {
    const u = await p.lis.celuiAvecEmail(login);

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
    if (donnees.entite)
      donnees.entite = await Entite.completeDonnees(
        donnees.entite,
        adaptateurRechercheEntite
      );

    await adaptateurPersistance.metsAJourUtilisateur(id, donnees);

    const u = await utilisateur(id);
    await busEvenements.publie(
      new EvenementUtilisateurModifie({ utilisateur: u })
    );
    return u;
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
