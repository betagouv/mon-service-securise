const expect = require('expect.js');

const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');
const fauxAdaptateurRechercheEntreprise = require('../mocks/adaptateurRechercheEntreprise');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');
const {
  ErreurEmailManquant,
  ErreurSuppressionImpossible,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
  ErreurMotDePasseIncorrect,
} = require('../../src/erreurs');
const Utilisateur = require('../../src/modeles/utilisateur');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const { fabriqueBusPourLesTests } = require('../bus/aides/busPourLesTests');
const EvenementUtilisateurModifie = require('../../src/bus/evenementUtilisateurModifie');
const EvenementUtilisateurInscrit = require('../../src/bus/evenementUtilisateurInscrit');

describe('Le dépôt de données des utilisateurs', () => {
  let adaptateurJWT;
  let adaptateurChiffrement;
  let adaptateurRechercheEntite;
  let bus;

  beforeEach(() => {
    adaptateurJWT = 'Un adaptateur';
    adaptateurChiffrement = fauxAdaptateurChiffrement();
    adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
    bus = fabriqueBusPourLesTests();
  });

  it("retourne l'utilisateur authentifié en cherchant par hash d'email", async () => {
    adaptateurChiffrement = {
      hacheBCrypt: async (chaine) => {
        expect(chaine).to.equal('mdp_12345');
        return '12345-chiffré';
      },
      hacheSha256: (chaine) => `${chaine}-haché256`,
      compareBCrypt: async (chaine1, chaine2) => {
        expect(chaine1).to.equal('mdp_12345');
        expect(chaine2).to.equal('12345-chiffré');
        return true;
      },
      chiffre: async (donnees) => donnees,
      dechiffre: async (donnees) => donnees,
    };

    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance: unePersistanceMemoire()
        .ajouteUnUtilisateur({
          id: '123',
          email: 'jean.dupont@mail.fr',
          emailHash: 'jean.dupont@mail.fr-haché256',
          motDePasse: '12345-chiffré',
        })
        .construis(),
    });

    const utilisateur = await depot.utilisateurAuthentifie(
      'jean.dupont@mail.fr',
      'mdp_12345'
    );

    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
  });

  it("sait dire que l'utilisateur a accepté les CGU actuelles lorsqu'il est récupéré par son hash d'email", async () => {
    const cguEnV2 = { cgu: () => ({ versionActuelle: () => 'v2.0' }) };
    const persistanceAvecUnUtilisateur =
      unePersistanceMemoire().ajouteUnUtilisateur({
        id: 'U2-ACCEPTE-OK',
        cguAcceptees: 'v2.0',
        email: 'marie@mail.fr',
        emailHash: 'marie@mail.fr',
        motDePasse: 'A',
      });

    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurEnvironnement: cguEnV2,
      adaptateurPersistance: persistanceAvecUnUtilisateur.construis(),
      adaptateurChiffrement: {
        hacheBCrypt: async (chaine) => chaine,
        hacheSha256: (chaine) => chaine,
        compareBCrypt: async () => true,
        chiffre: async (donnees) => donnees,
        dechiffre: async (donnees) => donnees,
      },
      adaptateurJWT,
    });

    const correct = await depot.utilisateurAuthentifie('marie@mail.fr', 'A');
    expect(correct.id).to.be('U2-ACCEPTE-OK');
    expect(correct.accepteCGU()).to.be(true);
  });

  it("sait dire que l'utilisateur n'a pas accepté les CGU actuelles lorsqu'il est récupéré par son hash d'email", async () => {
    const cguEnV2 = { cgu: () => ({ versionActuelle: () => 'v2.0' }) };
    const persistanceAvecUnUtilisateur =
      unePersistanceMemoire().ajouteUnUtilisateur({
        id: 'U1-ACCEPTE-OBSOLETE',
        cguAcceptees: 'v1.0',
        email: 'jean@mail.fr',
        emailHash: 'jean@mail.fr',
        motDePasse: 'A',
      });

    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurEnvironnement: cguEnV2,
      adaptateurPersistance: persistanceAvecUnUtilisateur.construis(),
      adaptateurChiffrement: {
        hacheBCrypt: async (chaine) => chaine,
        hacheSha256: (chaine) => chaine,
        compareBCrypt: async () => true,
        chiffre: async (donnees) => donnees,
        dechiffre: async (donnees) => donnees,
      },
      adaptateurJWT,
    });

    const obsolete = await depot.utilisateurAuthentifie('jean@mail.fr', 'A');
    expect(obsolete.id).to.be('U1-ACCEPTE-OBSOLETE');
    expect(obsolete.accepteCGU()).to.be(false);
  });

  it("met à jour le mot de passe d'un utilisateur", async () => {
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance: unePersistanceMemoire()
        .ajouteUnUtilisateur({
          id: '123',
          email: 'jean.dupont@mail.fr',
          emailHash: 'jean.dupont@mail.fr-haché256',
          motDePasse: 'mdp_origine-chiffré',
        })
        .construis(),
    });

    const avant = await depot.utilisateurAuthentifie(
      'jean.dupont@mail.fr',
      'mdp_12345'
    );
    expect(typeof avant).to.be('undefined');

    const misAJour = await depot.metsAJourMotDePasse('123', 'mdp_12345');
    expect(misAJour).to.be.an(Utilisateur);
    expect(misAJour.id).to.equal('123');
    expect(misAJour.adaptateurJWT).to.equal(adaptateurJWT);

    const apres = await depot.utilisateurAuthentifie(
      'jean.dupont@mail.fr',
      'mdp_12345'
    );
    expect(apres.id).to.equal('123');
  });

  it("n'authentifie pas un utilisateur sans mot de passe", async () => {
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance: unePersistanceMemoire()
        .ajouteUnUtilisateur({
          id: '123',
          email: 'jean.dupont@mail.fr',
          emailHash: 'jean.dupont@mail.fr-haché256',
          motDePasse: '',
        })
        .construis(),
    });

    const resultatAuthentification = await depot.utilisateurAuthentifie(
      'jean.dupont@mail.fr',
      ''
    );

    expect(resultatAuthentification).to.be(undefined);
  });

  describe('sur demande de mise à jour des informations du profil utilisateur', () => {
    let depot;
    let adaptateurPersistance;

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(
          unUtilisateur()
            .avecId('123')
            .avecIdResetMotDePasse('unIdReset')
            .quiSAppelle('Jean Dupont')
            .avecEmail('jean.dupont@mail.fr').donnees
        )
        .construis();
      depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurRechercheEntite,
        busEvenements: bus,
      });
    });

    it('met les informations à jour', async () => {
      await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur().avecId('123').quiSAppelle('Jérôme Dubois').donnees
      );
      const u = await depot.utilisateur('123');
      expect(u.prenom).to.equal('Jérôme');
      expect(u.nom).to.equal('Dubois');
    });

    it('chiffre les données', async () => {
      adaptateurChiffrement.chiffre = async (donnees) => ({
        ...donnees,
        chiffre: true,
      });

      await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur().avecId('123').quiSAppelle('Jérôme Dubois').donnees
      );

      const u = await adaptateurPersistance.utilisateur('123');
      expect(u.donnees.prenom).to.equal('Jérôme');
      expect(u.donnees.nom).to.equal('Dubois');
      expect(u.donnees.chiffre).to.equal(true);
    });

    it("met le hash de l'email à jour", async () => {
      await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur().avecId('123').avecEmail('jean.dubois@mail.fr').donnees
      );

      const u = await adaptateurPersistance.utilisateur('123');
      expect(u.emailHash).to.equal('jean.dubois@mail.fr-haché256');
    });

    it("ne modifie pas le hash de l'email s'il ne fait pas partie du delta de données", async () => {
      await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur().avecId('123').avecEmail('jean.dubois@mail.fr').donnees
      );

      const deltaSansEmail = { nom: 'Dupont', prenom: 'Jean' };
      await depot.metsAJourUtilisateur('123', deltaSansEmail);

      const u = await adaptateurPersistance.utilisateur('123');
      expect(u.emailHash).to.equal('jean.dubois@mail.fr-haché256');
    });

    it("ne modifie pas l'idResetMotDePasse s'il ne fait pas partie du delta de données", async () => {
      const deltaSansIdReset = { nom: 'Dupont', prenom: 'Jean' };

      await depot.metsAJourUtilisateur('123', deltaSansIdReset);

      const u = await depot.utilisateur('123');
      expect(u.idResetMotDePasse).to.equal('unIdReset');
    });

    it("complète les informations de l'entité et les enregistre", async () => {
      adaptateurRechercheEntite.rechercheOrganisations = async () => [
        { nom: 'MonEntite', departement: '75', siret: '12345' },
      ];

      const utilisateur = await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur()
          .avecId('123')
          .quiTravaillePourUneEntiteAvecSiret('12345').donnees
      );

      expect(utilisateur.entite.departement).to.equal('75');
      expect(utilisateur.entite.siret).to.equal('12345');
      expect(utilisateur.entite.nom).to.equal('MonEntite');
    });

    it("ne complète pas les informations de l'entité si le siret est manquant", async () => {
      let adaptateurAppele = false;
      adaptateurRechercheEntite.rechercheOrganisations = async () => {
        adaptateurAppele = true;
        return [{ nom: 'MonEntite', departement: '75', siret: '12345' }];
      };

      await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur()
          .avecId('123')
          .quiTravaillePourUneEntiteAvecSiret(undefined).donnees
      );

      expect(adaptateurAppele).to.be(false);
    });

    it('ignore les demandes de changement de mot de passe', async () => {
      await depot.metsAJourMotDePasse('123', 'mdp_12345');
      await depot.metsAJourUtilisateur('123', {
        ...unUtilisateur().avecId('123').avecEmail('jean.dupont@mail.fr')
          .donnees,
        motDePasse: 'non pris en compte',
      });

      const u = await depot.utilisateurAuthentifie(
        'jean.dupont@mail.fr',
        'mdp_12345'
      );

      if (!u)
        throw new Error(
          "Le dépôt aurait dû authentifier l'utilisateur avec le mot de passe inchangé"
        );
      expect(u.id).to.equal('123');
    });

    it("permet la mise à jour d'informations partielles du profil (ne plante pas si l'entité n'est pas fournie)", async () => {
      const sansEntite = unUtilisateur()
        .avecId('123')
        .quiSAppelle('Jérôme Dubois').donnees;
      delete sansEntite.entite;

      await depot.metsAJourUtilisateur('123', sansEntite);

      const u = await depot.utilisateur('123');
      expect(u.prenom).to.equal('Jérôme');
      expect(u.nom).to.equal('Dubois');
      // Le test passe si aucune exception n'est levée
    });

    it("publie sur le bus d'événements l'utilisateur modifié", async () => {
      await depot.metsAJourUtilisateur(
        '123',
        unUtilisateur().avecId('123').quiSAppelle('Jérôme Dubois').donnees
      );

      expect(bus.aRecuUnEvenement(EvenementUtilisateurModifie)).to.be(true);
      const recu = bus.recupereEvenement(EvenementUtilisateurModifie);
      expect(recu.utilisateur.id).to.be('123');
      expect(recu.utilisateur.prenom).to.be('Jérôme');
      expect(recu.utilisateur.nom).to.be('Dubois');
    });
  });

  it("retient qu'un utilisateur accepte les CGU", async () => {
    const jeanDupont = {
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      motDePasse: 'XXX',
    };

    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurEnvironnement: {
        cgu: () => ({ versionActuelle: () => 'v1.0' }),
      },
      adaptateurPersistance: AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', donnees: jeanDupont }],
      }),
    });

    const avant = await depot.utilisateur('123');
    expect(avant.accepteCGU()).to.be(false);

    await depot.valideAcceptationCGUPourUtilisateur(avant);
    const apres = await depot.utilisateur('123');
    expect(apres.accepteCGU()).to.be(true);
  });

  it('sait si un utilisateur existe', async () => {
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance: unePersistanceMemoire()
        .ajouteUnUtilisateur({
          id: '123',
          prenom: 'Jean',
          nom: 'Dupont',
          email: 'jean.dupont@mail.fr',
          motDePasse: 'XXX',
        })
        .construis(),
    });

    const connait123 = await depot.utilisateurExiste('123');
    expect(connait123).to.be(true);
    const connait999 = await depot.utilisateurExiste('999');
    expect(connait999).to.be(false);
  });

  it("retourne l'utilisateur associé à un identifiant donné en le déchiffrant", async () => {
    let donneeDechiffree;
    adaptateurChiffrement.dechiffre = async (objetDonnee) => {
      donneeDechiffree = objetDonnee;
      return { ...objetDonnee, email: 'dechiffre' };
    };

    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        utilisateurs: [
          {
            id: '123',
            donnees: {
              prenom: 'Jean',
              nom: 'Dupont',
              email: 'jean.dupont@mail.fr',
              motDePasse: 'XXX',
            },
          },
        ],
      }
    );
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance,
    });

    const utilisateur = await depot.utilisateur('123');

    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
    expect(utilisateur.email).to.equal('dechiffre');
    expect(donneeDechiffree).to.eql({
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      motDePasse: 'XXX',
    });
  });

  it("retourne l'utilisateur associé à un email donné", async () => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        utilisateurs: [
          {
            id: '123',
            donnees: {
              prenom: 'Jean',
              nom: 'Dupont',
              email: 'jean.dupont@mail.fr',
              motDePasse: 'XXX',
            },
            emailHash: 'jean.dupont@mail.fr-haché256',
          },
        ],
      }
    );
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance,
    });

    const utilisateur = await depot.utilisateurAvecEmail('jean.dupont@mail.fr');

    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
  });

  it('retourne tous les utilisateurs enregistrés', async () => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        utilisateurs: [
          {
            id: '123',
            donnees: {
              prenom: 'Jean',
              nom: 'Dupont',
              email: 'jean.dupont@mail.fr',
              motDePasse: 'XXX',
            },
          },
          {
            id: '456',
            donnees: {
              prenom: 'Murielle',
              nom: 'Renard',
              email: 'mr@mail.fr',
              motDePasse: 'ZZZ',
            },
          },
        ],
      }
    );
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance,
    });

    const tous = await depot.tousUtilisateurs();
    expect(tous.map((u) => u.id)).to.eql(['123', '456']);
    expect(tous[0]).to.be.an(Utilisateur);
    expect(tous[1]).to.be.an(Utilisateur);
  });

  it("retourne l'utilisateur avec sa date de création", (done) => {
    const date = new Date(2000, 1, 1, 12, 0);
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        utilisateurs: [
          {
            id: '123',
            donnees: {
              prenom: 'Jean',
              nom: 'Dupont',
              email: 'jean.dupont@mail.fr',
              motDePasse: 'XXX',
            },
            dateCreation: date,
          },
        ],
      }
    );
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance,
    });

    depot
      .utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.dateCreation).to.eql(date);
        done();
      })
      .catch(done);
  });

  it("retourne l'utilisateur associé à un identifiant reset de mot de passe", async () => {
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance: unePersistanceMemoire()
        .ajouteUnUtilisateur({
          id: '123',
          prenom: 'Jean',
          nom: 'Dupont',
          email: 'jean.dupont@mail.fr',
          idResetMotDePasse: '999',
        })
        .construis(),
    });

    const utilisateur = await depot.utilisateurAFinaliser('999');

    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
  });

  describe("sur réception d'une demande d'enregistrement d'un nouvel utilisateur", () => {
    let depot;

    describe("quand l'utilisateur n'existe pas déjà", () => {
      const adaptateurHorloge = {};
      let adaptateurPersistance;

      beforeEach(() => {
        let compteurId = 0;
        const adaptateurUUID = {
          genereUUID: () => {
            compteurId += 1;
            return `${compteurId}`;
          },
        };
        adaptateurHorloge.maintenant = () => new Date(2000, 1, 1, 12, 0);
        adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
          { utilisateurs: [] },
          adaptateurHorloge
        );
        depot = DepotDonneesUtilisateurs.creeDepot({
          adaptateurChiffrement,
          adaptateurJWT,
          adaptateurPersistance,
          adaptateurUUID,
          adaptateurRechercheEntite,
          busEvenements: bus,
        });
      });

      it("lève une exception et n'enregistre pas l'utilisateur si l'email n'est pas renseigné", async () => {
        let utilisateurCree = false;
        let erreurLevee;
        adaptateurPersistance.ajouteUtilisateur = async () => {
          utilisateurCree = true;
        };

        try {
          await depot.nouvelUtilisateur(
            unUtilisateur().quiSAppelle('Jean Dupont').sansEmail().donnees
          );
        } catch (erreur) {
          erreurLevee = true;
          expect(erreur).to.be.a(ErreurEmailManquant);
          expect(utilisateurCree).to.be(false);
        } finally {
          expect(erreurLevee).to.be(true);
        }
      });

      it("peut créer un utilisateur avec uniquement un email (comme lorsqu'on invite un collaborateur)", async () => {
        const utilisateur = await depot.nouvelUtilisateur({
          email: 'jean.dupont@mail.fr',
        });

        expect(utilisateur.email).to.equal('jean.dupont@mail.fr');
      });

      it("chiffre les données de l'utilisateur", async () => {
        adaptateurChiffrement.chiffre = async (donnees) => ({
          ...donnees,
          chiffre: true,
        });

        const utilisateur = await depot.nouvelUtilisateur({
          email: 'jean.dupont@mail.fr',
        });

        const donneesSauvegardees = await adaptateurPersistance.utilisateur(
          utilisateur.id
        );
        expect(donneesSauvegardees.donnees.chiffre).to.be(true);
      });

      it('génère un UUID pour cet utilisateur', async () => {
        const utilisateur = await depot.nouvelUtilisateur(
          unUtilisateur()
            .sansId()
            .quiSAppelle('Jean Dupont')
            .avecEmail('jean.dupont@mail.fr').donnees
        );

        expect(utilisateur.id).to.equal('1');
      });

      it("complète les informations de l'entité et les enregistre", async () => {
        adaptateurRechercheEntite.rechercheOrganisations = async () => [
          {
            nom: 'MonEntite',
            departement: '75',
            siret: '12345',
          },
        ];

        const utilisateur = await depot.nouvelUtilisateur(
          unUtilisateur().quiTravaillePourUneEntiteAvecSiret('12345').donnees
        );

        expect(utilisateur.entite.departement).to.equal('75');
        expect(utilisateur.entite.siret).to.equal('12345');
        expect(utilisateur.entite.nom).to.equal('MonEntite');
      });

      it('ajoute le nouvel utilisateur au dépôt', async () => {
        const u = await depot.utilisateur('1');
        expect(u).to.be(undefined);

        await depot.nouvelUtilisateur(
          unUtilisateur()
            .quiSAppelle('Jean Dupont')
            .avecEmail('jean.dupont@mail.fr').donnees
        );

        const utilisateur = await depot.utilisateur('1');
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.idResetMotDePasse).to.equal('2');
        expect(utilisateur.prenom).to.equal('Jean');
        expect(utilisateur.nom).to.equal('Dupont');
        expect(utilisateur.email).to.equal('jean.dupont@mail.fr');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
      });

      it('marque les emails transactionnels comme « acceptés »', async () => {
        const u = await depot.utilisateur('1');
        expect(u).to.be(undefined);

        await depot.nouvelUtilisateur(
          unUtilisateur().avecEmail('jean.dupont@mail.fr').donnees
        );

        const utilisateur = await depot.utilisateur('1');
        expect(utilisateur.transactionnelAccepte).to.be(true);
      });

      it('utilise la date actuelle comme date de création du nouvel utilisateur', async () => {
        const utilisateur = await depot.nouvelUtilisateur(
          unUtilisateur()
            .quiSAppelle('Jean Dupont')
            .avecEmail('jean.dupont@mail.fr').donnees
        );

        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.email).to.equal('jean.dupont@mail.fr');
        expect(utilisateur.dateCreation).to.eql(adaptateurHorloge.maintenant());
      });

      it("sauvegarde le hash256 de l'email de l'utilisateur", async () => {
        const nouveau = await depot.nouvelUtilisateur(
          unUtilisateur().avecEmail('jean.dupont@mail.fr').donnees
        );

        const donnees = await adaptateurPersistance.utilisateur(nouveau.id);

        expect(donnees.emailHash).to.be('jean.dupont@mail.fr-haché256');
      });

      it("publie sur le bus d'événements l'inscription de l'utilisateur", async () => {
        await depot.nouvelUtilisateur(
          unUtilisateur()
            .quiSAppelle('Jean Dupont')
            .avecEmail('jean.dupont@mail.fr').donnees
        );

        expect(bus.aRecuUnEvenement(EvenementUtilisateurInscrit)).to.be(true);
        const recu = bus.recupereEvenement(EvenementUtilisateurInscrit);
        expect(recu.utilisateur.id).not.to.be(undefined);
      });

      it("ne crée pas de mot de passe pour l'utilisateur", async () => {
        // il n’est pas nécessaire de générer un mot de passe pour l’utilisateur car il existe un contrôle
        // lors de l’authentification qui vérifie que le mot de passe est défini
        await depot.nouvelUtilisateur(unUtilisateur().donnees);

        const utilisateur = await adaptateurPersistance.utilisateur('1');
        expect(utilisateur.donnees.motDePasse).to.be(undefined);
      });
    });

    describe("quand l'utilisateur existe déjà", () => {
      it('lève une `ErreurUtilisateurExistant`', (done) => {
        const adaptateurPersistance =
          AdaptateurPersistanceMemoire.nouvelAdaptateur({
            utilisateurs: [
              {
                id: '123',
                donnees: {
                  email: 'jean.dupont@mail.fr',
                },
                emailHash: 'jean.dupont@mail.fr-haché256',
              },
            ],
          });
        depot = DepotDonneesUtilisateurs.creeDepot({
          adaptateurChiffrement,
          adaptateurPersistance,
        });

        depot
          .nouvelUtilisateur(
            unUtilisateur().avecEmail('jean.dupont@mail.fr').donnees
          )
          .then(() => done('Une exception aurait dû être levée.'))
          .catch((e) => {
            expect(e).to.be.a(ErreurUtilisateurExistant);
            expect(e.idUtilisateur).to.equal('123');
          })
          .then(() => done())
          .catch(done);
      });
    });

    it('supprime un identifiant de reset de mot de passe', async () => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            {
              id: '123',
              idResetMotDePasse: '999',
              donnees: {
                email: 'jean.dupont@mail.fr',
              },
            },
          ],
        });
      depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
      });
      const utilisateur = await depot.utilisateur('123');
      expect(utilisateur.idResetMotDePasse).to.equal('999');

      await depot.supprimeIdResetMotDePassePourUtilisateur(utilisateur);

      const nouvelUtilisateur = await depot.utilisateur('123');
      expect(nouvelUtilisateur.idResetMotDePasse).to.be(undefined);
    });
  });

  describe('Sur demande réinitialisation du mot de passe', () => {
    it("ajoute un identifiant de reset de mot de passe à l'utilisateur", async () => {
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurChiffrement,
        adaptateurUUID: {
          genereUUID: () => '11111111-1111-1111-1111-111111111111',
        },
        adaptateurPersistance: unePersistanceMemoire()
          .ajouteUnUtilisateur({
            id: '123',
            email: 'jean.dupont@mail.fr',
            emailHash: 'jean.dupont@mail.fr-haché256',
          })
          .construis(),
      });

      const avant = await depot.utilisateur('123');
      expect(avant.idResetMotDePasse).to.be(undefined);

      const apres = await depot.reinitialiseMotDePasse('jean.dupont@mail.fr');
      expect(apres.idResetMotDePasse).to.equal(
        '11111111-1111-1111-1111-111111111111'
      );
    });

    it("échoue silencieusement si l'utilisateur est inconnu", async () => {
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance: unePersistanceMemoire().construis(),
      });

      const u = await depot.reinitialiseMotDePasse('jean.dupont@mail.fr');

      expect(u).to.be(undefined);
    });
  });

  describe("sur demande de suppression d'un utilisateur", () => {
    it("lève une exception si l'utilisateur a créé des services", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          ],
          services: [
            { id: '123', descriptionService: { nomService: 'Un service' } },
          ],
          autorisations: [
            uneAutorisation().deProprietaire('999', '123').donnees,
          ],
        });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      });

      depot
        .supprimeUtilisateur('999')
        .then(() =>
          done('La tentative de suppression aurait dû lever une exception')
        )
        .catch((erreur) => {
          expect(erreur).to.be.an(ErreurSuppressionImpossible);
          expect(erreur.message).to.equal(
            'Suppression impossible : l\'utilisateur "999" a créé des services'
          );
          done();
        })
        .catch(done);
    });

    it("lève une exception si l'utilisateur n'existe pas", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur();
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
      });

      depot
        .supprimeUtilisateur('999')
        .then(() =>
          done('La tentative de suppression aurait dû lever une exception')
        )
        .catch((erreur) => {
          expect(erreur).to.be.an(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal('L\'utilisateur "999" n\'existe pas');
          done();
        })
        .catch(done);
    });

    it('supprime les autorisations de contribution pour cet utilisateur (mais pas les autres)', (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
            { id: '000', donnees: { email: 'un.autre.utilisateur@mail.fr' } },
          ],
          services: [
            { id: '123', descriptionService: { nomService: 'Un service' } },
          ],
          autorisations: [
            uneAutorisation().deContributeur('999', '123').donnees,
            uneAutorisation().deContributeur('000', '123').donnees,
          ],
        });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      });
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance,
      });

      depot
        .supprimeUtilisateur('999')
        .then(() => depotAutorisations.autorisations('999'))
        .then((autorisations) => expect(autorisations.length).to.equal(0))
        .then(() => depotAutorisations.autorisations('000'))
        .then((autorisations) => expect(autorisations.length).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it("supprime l'utilisateur", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          ],
        });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      });

      depot
        .supprimeUtilisateur('999')
        .then(() => depot.utilisateur('999'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  describe('sur demande de vérification du mot de passe', () => {
    it('jette une erreur si le mot de passe est incorrect', async () => {
      let erreurJetee;
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', motDePasse: 'MDP' }],
        });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      });

      try {
        await depot.verifieMotDePasse('123', 'MDP_INCORRECT');
      } catch (e) {
        erreurJetee = true;
        expect(e).to.be.an(ErreurMotDePasseIncorrect);
        expect(e.message).to.equal('Le mot de passe est incorrect');
      } finally {
        expect(erreurJetee).to.be(true);
      }
    });

    it("jette une erreur si aucun mot de passe n'est stocké", async () => {
      let erreurJetee;
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123' }],
        });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      });

      try {
        await depot.verifieMotDePasse('123', '');
      } catch (e) {
        erreurJetee = true;
        expect(e).to.be.an(ErreurMotDePasseIncorrect);
        expect(e.message).to.equal('Le mot de passe est incorrect');
      } finally {
        expect(erreurJetee).to.be(true);
      }
    });

    it('ne jette aucune erreur si le mot de passe est correct', async () => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', donnees: { motDePasse: 'MDP-haché' } }],
        });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      });

      await depot.verifieMotDePasse('123', 'MDP');
    });
  });
});
