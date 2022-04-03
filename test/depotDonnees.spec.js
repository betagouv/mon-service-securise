const expect = require('expect.js');
const bcrypt = require('bcrypt');

const DepotDonnees = require('../src/depotDonnees');
const {
  ErreurAutorisationExisteDeja,
  ErreurEmailManquant,
  ErreurHomologationInexistante,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
} = require('../src/erreurs');
const AdaptateurPersistanceMemoire = require('../src/adaptateurs/adaptateurPersistanceMemoire');
const AutorisationContributeur = require('../src/modeles/autorisations/autorisationContributeur');
const AutorisationCreateur = require('../src/modeles/autorisations/autorisationCreateur');
const Utilisateur = require('../src/modeles/utilisateur');

describe('Le dépôt de données persistées en mémoire', () => {
  describe('quand il est vide', () => {
    it('ne retourne aucune homologation pour un utilisateur donné', (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.homologations('456'))
        .then((hs) => expect(hs).to.eql([]))
        .then(() => done())
        .catch(done);
    });

    it('ne retourne rien si on cherche une homologation à partir de son identifiant', (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.homologation('123'))
        .then((h) => expect(h).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it('ne retourne rien si on cherche un utilisateur à partir de son identifiant', (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.utilisateur('456'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("n'authentifie pas l'utilisateur", (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
        .then((utilisateur) => expect(utilisateur).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  it("vérifie que l'utilisateur a accès à l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      autorisations: [
        { idUtilisateur: '456', idHomologation: '123', type: 'createur' },
      ],
    });

    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });
    depot.accesAutorise('456', '123')
      .then((accesAutorise) => expect(accesAutorise).to.be(true))
      .then(() => depot.accesAutorise('456', '999'))
      .then((accesAutorise) => expect(accesAutorise).to.be(false))
      .then(() => done())
      .catch(done);
  });

  it("retourne l'utilisateur authentifié", (done) => {
    const adaptateurJWT = {};

    bcrypt.hash('mdp_12345', 10)
      .then((hash) => {
        const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{
            id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: hash,
          }],
        });
        const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

        return depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345');
      })
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
    const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

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

      depot = DepotDonnees.creeDepot({ adaptateurPersistance });
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
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

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
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

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
    const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
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
    const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

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
      let adaptateurPersistance;

      beforeEach(() => {
        let compteurId = 0;
        const adaptateurUUID = { genereUUID: () => { compteurId += 1; return `${compteurId}`; } };
        adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [],
        });
        depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance, adaptateurUUID });
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
    });

    describe("quand l'utilisateur existe déjà", () => {
      it('lève une `ErreurUtilisateurExistant`', (done) => {
        const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        });
        depot = DepotDonnees.creeDepot({ adaptateurPersistance });

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
      depot = DepotDonnees.creeDepot({ adaptateurPersistance });

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
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

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
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

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
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.supprimeUtilisateur('999')
        .then(() => depot.homologation('123'))
        .then((h) => expect(h).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("supprime l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.supprimeUtilisateur('999')
        .then(() => depot.utilisateur('999'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  describe("Sur demande de transfert des autorisations d'un utilisateur à un autre", () => {
    it("vérifie que l'utilisateur source existe", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({});
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.transfereAutorisations('999', '000')
        .then(() => done('Le transfert aurait dû lever une erreur'))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal("L'utilisateur \"999\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it("vérifie que l'utilisateur cible existe", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.transfereAutorisations('999', '000')
        .then(() => done('Le transfert aurait dû lever une erreur'))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal("L'utilisateur \"000\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it('effectue le transfert', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'autre.utilisateur@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.transfereAutorisations('999', '000')
        .then(() => depot.autorisations('999'))
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depot.autorisations('000'))
        .then((as) => {
          expect(as.length).to.equal(1);
          expect(as[0]).to.be.an(AutorisationCreateur);
          expect(as[0].idHomologation).to.equal('123');
          done();
        })
        .catch(done);
    });
  });

  describe("sur recherche d'une autorisation", () => {
    it("retourne l'autorisation persistée", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.autorisation('456')
        .then((a) => {
          expect(a).to.be.an(AutorisationCreateur);
          expect(a.id).to.equal('456');
          expect(a.idUtilisateur).to.equal('999');
          expect(a.idHomologation).to.equal('123');
          done();
        })
        .catch(done);
    });

    it("retourne `undefined` si l'autorisation est inexistante", (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.autorisation('123'))
        .then((autorisation) => expect(autorisation).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  it('sait si une autorisation existe', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
      autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.autorisationExiste('999', '123')
      .then((existe) => expect(existe).to.be(true))
      .then(() => depot.autorisationExiste('999', '000'))
      .then((existe) => expect(existe).to.be(false))
      .then(() => depot.autorisationExiste('000', '123'))
      .then((existe) => expect(existe).to.be(false))
      .then(() => done())
      .catch(done);
  });

  describe("sur demande d'ajout d'un contributeur à une homologation", () => {
    const adaptateurUUID = { genereUUID: () => {} };

    it('lève une erreur si le contributeur est inexistant', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('000', '123')
        .then(() => done("L'ajout aurait du lever une erreur"))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal("Le contributeur \"000\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it("lève une erreur si l'homologation est inexistante", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'contributeur@mail.fr' },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('000', '123')
        .then(() => done("L'ajout aurait du lever une erreur"))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurHomologationInexistante);
          expect(erreur.message).to.equal("L'homologation \"123\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it("lève une erreur si l'autorisation existe déjà", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('999', '123')
        .then(() => done("L'ajout aurait du lever une erreur"))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurAutorisationExisteDeja);
          expect(erreur.message).to.equal("L'autorisation existe déjà");
          done();
        })
        .catch(done);
    });

    it("persiste l'autorisation", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'contributeur@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      adaptateurUUID.genereUUID = () => '789';
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('000', '123')
        .then(() => depot.autorisation('789'))
        .then((a) => {
          expect(a).to.be.a(AutorisationContributeur);
          expect(a.idHomologation).to.equal('123');
          expect(a.idUtilisateur).to.equal('000');
          done();
        })
        .catch(done);
    });
  });

  it("connaît l'autorisation pour un utilisateur et une homologation donnée", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
      autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });
    depot.autorisationPour('999', '123')
      .then((a) => {
        expect(a).to.be.an(AutorisationCreateur);
        expect(a.id).to.equal('456');
        done();
      })
      .catch(done);
  });
});
