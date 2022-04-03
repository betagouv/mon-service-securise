const expect = require('expect.js');

const DepotDonnees = require('../src/depotDonnees');

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
});
