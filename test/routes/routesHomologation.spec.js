const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /homologation/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/homologation/:id`', () => {
    beforeEach(() => (testeur.adaptateurEnvironnement().avecAccesEtapier = () => true));

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456',
        done,
      );
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

  describe('quand requête GET sur `/homologation/:id/syntheseSecurite/annexes/mesures`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/syntheseSecurite/annexes/mesures',
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

  describe('quand requête GET sur `/homologation/:id/dossiers`', () => {
    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/dossiers',
        done,
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/dossier/nouveau`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({ etapesParcoursHomologation: [{ numero: 1 }] });
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = () => Promise.resolve();
    });

    it('redirige vers `/homologation/:id/dossier/edition/etape/1`', (done) => {
      axios('http://localhost:1234/homologation/456/dossier/nouveau')
        .then((reponse) => expect(reponse.request.res.responseUrl).to.equal('http://localhost:1234/homologation/456/dossier/edition/etape/1'))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête GET sur `/homologation/:id/dossier/edition/etape/:idEtape`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({ etapesParcoursHomologation: [{ numero: 1 }] });
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/homologation/456/dossier/edition/etape/1',
        done,
      );
    });

    it("répond avec une erreur HTTP 404 si l'identifiant d'étape n'est pas connu du référentiel", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(404, 'Étape inconnue', {
        method: 'get',
        url: 'http://localhost:1234/homologation/456/dossier/edition/etape/2',
      }, done);
    });

    it("ajoute un dossier courant à l'homologation si nécessaire", (done) => {
      let dossierAjoute = false;
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = (idHomologation) => {
        try {
          expect(idHomologation).to.equal('456');
          dossierAjoute = true;
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios('http://localhost:1234/homologation/456/dossier/edition/etape/1')
        .then(() => expect(dossierAjoute).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });
});
