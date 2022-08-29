const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/service/:id/homologations`', () => {
    it("recherche la ressource correspondant à l'identifiant", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/service/456/homologations',
        done,
      );
    });
  });
});
