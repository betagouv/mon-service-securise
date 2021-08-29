const expect = require('expect.js');

const AdaptateurPostgres = require('../../src/adaptateurs/adaptateurPostgres');

describe("L'adaptateur PostgreSQL", () => {
  const adaptateur = AdaptateurPostgres.nouvelAdaptateur('test');

  beforeEach(() => adaptateur.supprimeUtilisateurs());
  after(() => adaptateur.arreteTout());

  it('compte les utilisateurs enregistrés', (done) => {
    adaptateur.nbUtilisateurs()
      .then((nb) => {
        expect(nb).to.equal(0);
        done();
      })
      .catch(done);
  });

  it('ajoute un utilisateur', (done) => {
    adaptateur.ajouteUtilisateur('11111111-1111-1111-1111-111111111111', {
      prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr',
    })
      .then(() => adaptateur.nbUtilisateurs())
      .then((nb) => expect(nb).to.equal(1))
      .then(() => done())
      .catch(done);
  });
});
