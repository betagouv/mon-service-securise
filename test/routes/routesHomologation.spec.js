const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');

const middleware = require('../mocks/middleware');

describe('Le serveur MSS des routes /homologation/*', () => {
  let serveur;

  before((done) => {
    const referentiel = Referentiel.creeReferentielVide();

    serveur = MSS.creeServeur({}, middleware, referentiel, {}, false);
    serveur.ecoute(1234, done);
  });

  beforeEach(() => {
    middleware.reinitialise();
  });

  after(() => { serveur.arreteEcoute(); });

  describe('quand requête GET sur `/homologation/:id`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456', done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/descriptionService`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/descriptionService', done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/caracteristiquesComplementaires`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/caracteristiquesComplementaires', done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/decision`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/decision', done);
    });

    it('sert la page avec un nonce', (done) => {
      middleware.verifieRequetePositionneHeadersAvecNonce('http://localhost:1234/homologation/456/decision', done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/mesures`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/mesures', done);
    });
  });

  describe('quand requete GET sur `/homologation/:id/partiesPrenantes`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/partiesPrenantes', done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/risques`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/risques', done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/avisExpertCyber`', () => {
    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation('http://localhost:1234/homologation/456/avisExpertCyber', done);
    });
  });
});
