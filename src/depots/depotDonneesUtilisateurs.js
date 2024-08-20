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

const fabriqueChiffrement = (adaptateurChiffrement) => ({
  dechiffre: {
    donneesUtilisateur: async (donnees) =>
      adaptateurChiffrement.dechiffre(donnees),
  },
  chiffre: {
    donneesUtilisateur: async (donnees) =>
      adaptateurChiffrement.chiffre(donnees),
  },
});

function fabriquePersistance({
  adaptateurPersistance,
  adaptateurJWT,
  adaptateurChiffrement,
}) {
  const { chiffre, dechiffre } = fabriqueChiffrement(adaptateurChiffrement);

  const dechiffreDonneesUtilisateur = async (donneesUtilisateur) => {
    if (!donneesUtilisateur) return undefined;
    const donneesEnClair = await dechiffre.donneesUtilisateur(
      donneesUtilisateur.donnees
    );
    return {
      ...donneesEnClair,
      id: donneesUtilisateur.id,
      idResetMotDePasse: donneesUtilisateur.idResetMotDePasse,
    };
  };

  const dechiffreUtilisateur = async (donneesUtilisateur) => {
    if (!donneesUtilisateur) return undefined;
    const donneesDechiffrees =
      await dechiffreDonneesUtilisateur(donneesUtilisateur);
    return new Utilisateur(donneesDechiffrees, { adaptateurJWT });
  };

  return {
    dechiffreUtilisateur: async (donneesUtilisateur) =>
      dechiffreUtilisateur(donneesUtilisateur),
    lis: {
      donnees: {
        de: async (idUtilisateur) => {
          const donnees =
            await adaptateurPersistance.utilisateur(idUtilisateur);
          return dechiffreDonneesUtilisateur(donnees);
        },
        deCeluiAvecEmail: async (email) => {
          const emailHash = adaptateurChiffrement.hacheSha256(email);
          const donnees =
            await adaptateurPersistance.utilisateurAvecEmailHash(emailHash);
          return dechiffreDonneesUtilisateur(donnees);
        },
      },
      un: async (idUtilisateur) => {
        const donnees = await adaptateurPersistance.utilisateur(idUtilisateur);
        return dechiffreUtilisateur(donnees);
      },
      celuiAvecEmail: async (email) => {
        const emailHash = adaptateurChiffrement.hacheSha256(email);
        const donnees =
          await adaptateurPersistance.utilisateurAvecEmailHash(emailHash);
        return dechiffreUtilisateur(donnees);
      },
      celuiAvecIdReset: async (idReset) => {
        const donnees =
          await adaptateurPersistance.utilisateurAvecIdReset(idReset);
        return dechiffreUtilisateur(donnees);
      },
      nbAutorisationsProprietaire: async (idUtilisateur) =>
        adaptateurPersistance.nbAutorisationsProprietaire(idUtilisateur),
      tous: async () => {
        const tousUtilisateurs = await adaptateurPersistance.tousUtilisateurs();
        return Promise.all(
          tousUtilisateurs.map((d) => dechiffreUtilisateur(d))
        );
      },
    },
    ajoute: async (id, donneesUtilisateur) => {
      const emailHash = adaptateurChiffrement.hacheSha256(
        donneesUtilisateur.email
      );
      const donneesChiffrees =
        await chiffre.donneesUtilisateur(donneesUtilisateur);
      return adaptateurPersistance.ajouteUtilisateur(
        id,
        donneesChiffrees,
        emailHash
      );
    },
    sauvegarde: async (id, deltaDonnees) => {
      const emailHash = deltaDonnees.email
        ? adaptateurChiffrement.hacheSha256(deltaDonnees.email)
        : undefined;
      const donneesSauvegardees = await adaptateurPersistance.utilisateur(id);
      const donneesEnClair =
        await dechiffreDonneesUtilisateur(donneesSauvegardees);
      const donneesEnClairAJour = Object.assign(donneesEnClair, deltaDonnees);
      const {
        emailHash: _,
        idResetMotDePasse: __,
        ...donneesEnClairASauvegarder
      } = donneesEnClairAJour;
      const donneesChiffreesASauvegarder = await chiffre.donneesUtilisateur(
        donneesEnClairASauvegarder
      );
      await adaptateurPersistance.metsAJourUtilisateur(
        id,
        donneesChiffreesASauvegarder,
        emailHash
      );
    },
    supprime: async (id) => {
      await adaptateurPersistance.supprimeAutorisationsContribution(id);
      await adaptateurPersistance.supprimeUtilisateur(id);
    },
    idResetMotDePasse: {
      sauvegarde: async (id, idResetMotDePasse) =>
        adaptateurPersistance.metsAJourIdResetMdpUtilisateur(
          id,
          idResetMotDePasse
        ),
      efface: async (id) =>
        adaptateurPersistance.metsAJourIdResetMdpUtilisateur(id, undefined),
    },
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

  const p = fabriquePersistance({
    adaptateurPersistance,
    adaptateurJWT,
    adaptateurChiffrement,
  });

  const dechiffreUtilisateur = async (donneesUtilisateur) =>
    p.dechiffreUtilisateur(donneesUtilisateur);

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
    const idResetMotDePasse = adaptateurUUID.genereUUID();
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
    await p.idResetMotDePasse.sauvegarde(id, idResetMotDePasse);
    u = await p.lis.un(id);

    await busEvenements.publie(
      new EvenementUtilisateurInscrit({ utilisateur: u })
    );

    return u;
  };

  const utilisateurAFinaliser = async (idReset) =>
    p.lis.celuiAvecIdReset(idReset);

  const utilisateurAuthentifie = async (login, motDePasse) => {
    const u = await p.lis.donnees.deCeluiAvecEmail(login);

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
    const u = await p.lis.un(id);
    return !!u;
  };

  const utilisateurAvecEmail = async (email) => p.lis.celuiAvecEmail(email);

  const metsAJourMotDePasse = async (idUtilisateur, motDePasse) => {
    const hash = await adaptateurChiffrement.hacheBCrypt(motDePasse);
    await p.sauvegarde(idUtilisateur, { motDePasse: hash });
    return p.lis.un(idUtilisateur);
  };

  const metsAJourUtilisateur = async (id, donnees) => {
    delete donnees.motDePasse;
    if (donnees.entite)
      donnees.entite = await Entite.completeDonnees(
        donnees.entite,
        adaptateurRechercheEntite
      );

    await p.sauvegarde(id, donnees);

    const u = await p.lis.un(id);
    await busEvenements.publie(
      new EvenementUtilisateurModifie({ utilisateur: u })
    );
    return u;
  };

  const reinitialiseMotDePasse = async (email) => {
    const u = await p.lis.celuiAvecEmail(email);
    if (!u) return undefined;

    const idResetMotDePasse = adaptateurUUID.genereUUID();
    await p.idResetMotDePasse.sauvegarde(u.id, idResetMotDePasse);
    return p.lis.un(u.id);
  };

  const supprimeIdResetMotDePassePourUtilisateur = async (
    utilisateurAModifier
  ) => {
    const { id } = utilisateurAModifier;
    await p.idResetMotDePasse.efface(id);
    return p.lis.un(id);
  };

  const supprimeUtilisateur = async (id) => {
    const verifieUtilisateurExistant = async () => {
      const u = await p.lis.un(id);
      if (typeof u === 'undefined')
        throw new ErreurUtilisateurInexistant(
          `L'utilisateur "${id}" n'existe pas`
        );
    };

    const verifieUtilisateurPasProprietaire = async () => {
      const nb = await p.lis.nbAutorisationsProprietaire(id);
      if (nb > 0)
        throw new ErreurSuppressionImpossible(
          `Suppression impossible : l'utilisateur "${id}" a créé des services`
        );
    };

    await verifieUtilisateurExistant();
    await verifieUtilisateurPasProprietaire();
    await p.supprime(id);
  };

  const tousUtilisateurs = async () => p.lis.tous();

  const valideAcceptationCGUPourUtilisateur = async (utilisateurAModifier) => {
    await p.sauvegarde(utilisateurAModifier.id, { cguAcceptees: true });
    return p.lis.un(utilisateurAModifier.id);
  };

  const verifieMotDePasse = async (idUtilisateur, motDePasse) => {
    const erreurMotDePasseIncorrect = new ErreurMotDePasseIncorrect(
      'Le mot de passe est incorrect'
    );
    const u = await p.lis.donnees.de(idUtilisateur);

    const motDePasseStocke = u && u.motDePasse;

    if (!motDePasseStocke) throw erreurMotDePasseIncorrect;

    const authentificationReussie = await adaptateurChiffrement.compareBCrypt(
      motDePasse,
      motDePasseStocke
    );

    if (!authentificationReussie) throw erreurMotDePasseIncorrect;
  };

  return {
    dechiffreUtilisateur,
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
