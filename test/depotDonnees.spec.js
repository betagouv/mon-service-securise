const expect = require('expect.js');

const { depotVide } = require('./depots/depotVide');

describe('Le dépôt de données vide', () => {
  it('ne retourne aucun service pour un utilisateur donné', (done) => {
    depotVide()
      .then((depot) => depot.services('456'))
      .then((services) => expect(services).to.eql([]))
      .then(() => done())
      .catch(done);
  });

  it('ne retourne rien si on cherche un service à partir de son identifiant', (done) => {
    depotVide()
      .then((depot) => depot.service('123'))
      .then((s) => expect(s).to.be(undefined))
      .then(() => done())
      .catch(done);
  });

  it('ne retourne rien si on cherche un utilisateur à partir de son identifiant', (done) => {
    depotVide()
      .then((depot) => depot.utilisateur('456'))
      .then((u) => expect(u).to.be(undefined))
      .then(() => done())
      .catch(done);
  });

  it("n'authentifie pas l'utilisateur", (done) => {
    depotVide()
      .then((depot) =>
        depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
      )
      .then((utilisateur) => expect(utilisateur).to.be(undefined))
      .then(() => done())
      .catch(done);
  });
});
