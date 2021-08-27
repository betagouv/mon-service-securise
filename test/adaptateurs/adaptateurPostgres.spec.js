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
});
