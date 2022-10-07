const axios = require('axios');
const expect = require('expect.js');
const pug = require('pug');

const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /homologation/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/homologation/:id`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456',
        done,
      );
    });

    describe('selon la valeur de la variable `AVEC_SYNTHESE_V2`', () => {
      let variableEnvironnement;
      let fonctionRendu;

      beforeEach(() => {
        variableEnvironnement = process.env.AVEC_SYNTHESE_V2;
        fonctionRendu = pug.renderFile;
      });

      afterEach(() => {
        process.env.AVEC_SYNTHESE_V2 = variableEnvironnement;
        pug.renderFile = fonctionRendu;
      });

      const verifieVersionTemplate = (versionAttendue, regExpTemplate, requete, suite) => {
        let actionsSaisieChargees = false;

        testeur.referentiel().actionsSaisie = (version) => {
          expect(version).to.equal(versionAttendue);
          actionsSaisieChargees = true;
          return {};
        };

        pug.renderFile = (nomTemplate, ...params) => {
          expect(nomTemplate).to.match(regExpTemplate);
          return fonctionRendu(nomTemplate, ...params);
        };

        axios(requete)
          .then(() => {
            expect(actionsSaisieChargees).to.be(true);
            suite();
          })
          .catch((e) => suite(e.response?.data || e));
      };

      it("sert l'ancienne version de la page de synthèse (v1) par défaut", (done) => {
        delete process.env.AVEC_SYNTHESE_V2;
        verifieVersionTemplate('v1', /\/homologation.pug$/, 'http://localhost:1234/homologation/456', done);
      });

      it('sert la nouvelle version de la page de synthèse si `AVEC_SYNTHESE_V2` est présente', (done) => {
        process.env.AVEC_SYNTHESE_V2 = 'true';
        verifieVersionTemplate('v2', /\/homologation\/synthese.pug$/, 'http://localhost:1234/homologation/456', done);
      });
    });
  });

  describe('quand requête GET sur `/homologation/:id/descriptionService`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/descriptionService',
        done,
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/decision`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/decision',
        done,
      );
    });

    it('sert la page avec un nonce', (done) => {
      testeur.middleware().verifieRequetePositionneHeadersAvecNonce(
        'http://localhost:1234/homologation/456/decision',
        done,
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/syntheseSecurite`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/syntheseSecurite',
        done,
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/mesures`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/mesures',
        done
      );
    });

    it('interroge le moteur de règles pour obtenir les mesures personnalisées', (done) => {
      let moteurInterroge = false;
      const requete = {};

      testeur.middleware().trouveHomologation(requete, undefined, () => {
        const { nomService } = requete.homologation.descriptionService;
        expect(nomService).to.equal('un service'); // sanity check
      });

      testeur.moteurRegles().mesures = (descriptionService) => {
        expect(descriptionService.nomService).to.equal('un service');
        moteurInterroge = true;
        return {};
      };

      axios('http://localhost:1234/homologation/456/mesures')
        .then(() => expect(moteurInterroge).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requete GET sur `/homologation/:id/rolesResponsabilites`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/rolesResponsabilites',
        done,
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/risques`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/risques',
        done,
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/avisExpertCyber`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/avisExpertCyber',
        done,
      );
    });
  });
});
