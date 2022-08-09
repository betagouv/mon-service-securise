const expect = require('expect.js');

const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');
const {
  ErreurEmailManquant,
  ErreurUtilisateurExistant,
} = require('../../src/erreurs');
const Utilisateur = require('../../src/modeles/utilisateur');

describe('Le dépôt de données des utilisateurs', () => {
  it("retourne l'utilisateur authentifié", (done) => {
    const adaptateurJWT = {};
    const adaptateurChiffrement = {
      chiffre: (chaine) => {
        expect(chaine).to.equal('mdp_12345');
        return Promise.resolve('12345-chiffré');
      },
      compare: (chaine1, chaine2) => {
        expect(chaine1).to.equal('mdp_12345');
        expect(chaine2).to.equal('12345-chiffré');
        return Promise.resolve(true);
      },
    };

    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: '12345-chiffré',
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement,
      adaptateurJWT,
      adaptateurPersistance,
    });

    depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
        done();
      })
      .catch(done);
  });

  it("met à jour le mot de passe d'un utilisateur", (done) => {
    const adaptateurJWT = {};
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
      .then((utilisateur) => expect(typeof utilisateur).to.be('undefined'))
      .then(() => depot.metsAJourMotDePasse('123', 'mdp_12345'))
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
      })
      .then(() => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
      .then((utilisateur) => expect(utilisateur.id).to.equal('123'))
      .then(() => done())
      .catch(done);
  });

  describe('sur demande de mise à jour des informations du profil utilisateur', () => {
    let depot;

    beforeEach(() => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' }],
      });

      depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance });
    });

    it('met les informations à jour', (done) => {
      depot.metsAJourUtilisateur('123', { prenom: 'Jérôme', nom: 'Dubois' })
        .then(() => depot.utilisateur('123'))
        .then((u) => {
          expect(u.prenom).to.equal('Jérôme');
          expect(u.nom).to.equal('Dubois');
          done();
        })
        .catch(done);
    });

    it('ignore les demandes de changement de mot de passe', (done) => {
      depot.metsAJourMotDePasse('123', 'mdp_12345')
        .then(() => depot.metsAJourUtilisateur('123', { nom: 'Dubois', motDePasse: 'non pris en compte' }))
        .then(() => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
        .then((u) => {
          if (!u) throw new Error("Le dépôt aurait dû authentifier l'utilisateur avec le mot de passe inchangé");

          expect(u.id).to.equal('123');
          done();
        })
        .catch(done);
    });
  });

  it("retient qu'un utilisateur accepte les CGU", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance });

    depot.utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur.accepteCGU()).to.be(false);
        return utilisateur;
      })
      .then(depot.valideAcceptationCGUPourUtilisateur)
      .then(() => depot.utilisateur('123'))
      .then((utilisateur) => expect(utilisateur.accepteCGU()).to.be(true))
      .then(() => done())
      .catch(done);
  });

  it('sait si un utilisateur existe', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance });

    depot.utilisateurExiste('123')
      .then((utilisateurExiste) => expect(utilisateurExiste).to.be(true))
      .then(() => depot.utilisateurExiste('999'))
      .then((utilisateurExiste) => expect(utilisateurExiste).to.be(false))
      .then(() => done())
      .catch(done);
  });

  it("retourne l'utilisateur associé à un identifiant donné", (done) => {
    const adaptateurJWT = 'Un adaptateur';
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
        done();
      })
      .catch(done);
  });

  it("retourne l'utilisateur avec sa date de création", (done) => {
    const adaptateurJWT = 'Un adaptateur';
    const date = new Date(2000, 1, 1, 12, 0);
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX', dateCreation: date,
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.dateCreation).to.eql(date);
        done();
      })
      .catch(done);
  });

  it("retourne l'utilisateur associé à un identifiant reset de mot de passe", (done) => {
    const adaptateurJWT = 'Un adaptateur';
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', idResetMotDePasse: '999',
      }],
    });
    const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateurAFinaliser('999')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
        done();
      })
      .catch(done);
  });

  describe("sur réception d'une demande d'enregistrement d'un nouvel utilisateur", () => {
    const adaptateurJWT = 'Un adaptateur';
    let depot;

    describe("quand l'utilisateur n'existe pas déjà", () => {
      const adaptateurHorloge = {};
      let adaptateurPersistance;

      beforeEach(() => {
        let compteurId = 0;
        const adaptateurUUID = { genereUUID: () => { compteurId += 1; return `${compteurId}`; } };
        adaptateurHorloge.maintenant = () => new Date(2000, 1, 1, 12, 0);
        adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
          { utilisateurs: [] },
          adaptateurHorloge,
        );
        depot = DepotDonneesUtilisateurs.creeDepot({
          adaptateurJWT, adaptateurPersistance, adaptateurUUID,
        });
      });

      it("lève une exception et n'enregistre pas l'utilisateur si l'email n'est pas renseigné", (done) => {
        let utilisateurCree = false;
        adaptateurPersistance.ajouteUtilisateur = () => Promise.resolve(utilisateurCree = true);

        depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont' })
          .then(() => done("La création de l'utilisateur aurait dû lever une ErreurEmailManquant"))
          .catch((erreur) => {
            expect(erreur).to.be.a(ErreurEmailManquant);
            expect(utilisateurCree).to.be(false);
            done();
          })
          .catch(done);
      });

      it('génère un UUID pour cet utilisateur', (done) => {
        depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' })
          .then((utilisateur) => {
            expect(utilisateur.id).to.equal('1');
            done();
          })
          .catch(done);
      });

      it('ajoute le nouvel utilisateur au dépôt', (done) => {
        depot.utilisateur('1')
          .then((u) => expect(u).to.be(undefined))
          .then(() => depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' }))
          .then(() => depot.utilisateur('1'))
          .then((utilisateur) => {
            expect(utilisateur).to.be.an(Utilisateur);
            expect(utilisateur.idResetMotDePasse).to.equal('2');
            expect(utilisateur.prenom).to.equal('Jean');
            expect(utilisateur.nom).to.equal('Dupont');
            expect(utilisateur.email).to.equal('jean.dupont@mail.fr');
            expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
            done();
          })
          .catch(done);
      });

      it('utilise la date actuelle comme date de création du nouvel utilisateur', (done) => {
        depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' })
          .then((utilisateur) => {
            expect(utilisateur).to.be.an(Utilisateur);
            expect(utilisateur.email).to.equal('jean.dupont@mail.fr');
            expect(utilisateur.dateCreation).to.eql(adaptateurHorloge.maintenant());
            done();
          })
          .catch(done);
      });
    });

    describe("quand l'utilisateur existe déjà", () => {
      it('lève une `ErreurUtilisateurExistant`', (done) => {
        const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        });
        depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance });

        depot.nouvelUtilisateur({ email: 'jean.dupont@mail.fr' })
          .then(() => done('Une exception aurait dû être levée.'))
          .catch((e) => expect(e).to.be.a(ErreurUtilisateurExistant))
          .then(() => done())
          .catch(done);
      });
    });

    it('supprime un identifiant de reset de mot de passe', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr', idResetMotDePasse: '999' }],
      });
      depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance });

      depot.utilisateur('123')
        .then((utilisateur) => {
          expect(utilisateur.idResetMotDePasse).to.equal('999');
          depot.supprimeIdResetMotDePassePourUtilisateur(utilisateur);
        })
        .then(() => depot.utilisateur('123'))
        .then((utilisateur) => expect(utilisateur.idResetMotDePasse).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  describe('Sur demande réinitialisation du mot de passe', () => {
    it("ajoute un identifiant de reset de mot de passe à l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
      });
      const adaptateurUUID = { genereUUID: () => '11111111-1111-1111-1111-111111111111' };
      const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.utilisateur('123')
        .then((u) => expect(u.idResetMotDePasse).to.be(undefined))
        .then(() => depot.reinitialiseMotDePasse('jean.dupont@mail.fr'))
        .then((u) => expect(u.idResetMotDePasse).to.equal('11111111-1111-1111-1111-111111111111'))
        .then(() => done())
        .catch(done);
    });

    it("échoue silencieusement si l'utilisateur est inconnu", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [],
      });
      const depot = DepotDonneesUtilisateurs.creeDepot({ adaptateurPersistance });

      depot.reinitialiseMotDePasse('jean.dupont@mail.fr')
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  describe("sur demande de suppression d'un utilisateur", () => {
    it("supprime les homologations associées à l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depotHomologations = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance, depotHomologations,
      });

      depot.supprimeUtilisateur('999')
        .then(() => depotHomologations.homologation('123'))
        .then((h) => expect(h).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("supprime l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      });
      const depotHomologations = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });
      const depot = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance, depotHomologations,
      });

      depot.supprimeUtilisateur('999')
        .then(() => depot.utilisateur('999'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });
});
