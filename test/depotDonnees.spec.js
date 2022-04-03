const expect = require('expect.js');

const DepotDonnees = require('../src/depotDonnees');
const {
  ErreurAutorisationExisteDeja,
  ErreurHomologationInexistante,
  ErreurUtilisateurInexistant,
} = require('../src/erreurs');
const AdaptateurPersistanceMemoire = require('../src/adaptateurs/adaptateurPersistanceMemoire');
const AutorisationContributeur = require('../src/modeles/autorisations/autorisationContributeur');
const AutorisationCreateur = require('../src/modeles/autorisations/autorisationCreateur');

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
