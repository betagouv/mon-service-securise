const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./testeurMSS');
const Homologation = require('../../src/modeles/homologation');

describe('Le serveur MSS des routes /service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/service/:id`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/descriptionService`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/descriptionService',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/decision`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/decision',
        done,
      );
    });

    it('sert la page avec un nonce', (done) => {
      testeur.middleware().verifieRequetePositionneHeadersAvecNonce(
        'http://localhost:1234/service/456/decision',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/syntheseSecurite`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/syntheseSecurite',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/syntheseSecurite/annexes/mesures`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/syntheseSecurite/annexes/mesures',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/mesures`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/mesures',
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

      axios('http://localhost:1234/service/456/mesures')
        .then(() => expect(moteurInterroge).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requete GET sur `/service/:id/rolesResponsabilites`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/rolesResponsabilites',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/risques`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/risques',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/avisExpertCyber`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/avisExpertCyber',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/dossiers`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/dossiers',
        done,
      );
    });
  });

  describe('quand requête GET sur `/service/:id/dossier/edition/etape/:idEtape`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({ etapesParcoursHomologation: [{ numero: 1 }] });
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = () => Promise.resolve();
      testeur.depotDonnees().homologation = () => Promise.resolve(
        new Homologation({ id: '456', descriptionService: { nomService: 'un service' } })
      );
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/service/456/dossier/edition/etape/1',
        done,
      );
    });

    it("répond avec une erreur HTTP 404 si l'identifiant d'étape n'est pas connu du référentiel", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(404, 'Étape inconnue', {
        method: 'get',
        url: 'http://localhost:1234/service/456/dossier/edition/etape/2',
      }, done);
    });

    it('ajoute un dossier courant au service si nécessaire', (done) => {
      let dossierAjoute = false;
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = (idService) => {
        try {
          expect(idService).to.equal('456');
          dossierAjoute = true;
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios('http://localhost:1234/service/456/dossier/edition/etape/1')
        .then(() => expect(dossierAjoute).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it('recharge le service avant de servir la vue', (done) => {
      let chargementsService = 0;
      testeur.depotDonnees().homologation = () => {
        try {
          chargementsService += 1;
          return Promise.resolve(new Homologation({ id: '456', descriptionService: { nomService: 'un service' } }));
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios('http://localhost:1234/service/456/dossier/edition/etape/1')
        .then(() => expect(chargementsService).to.equal(1))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });
});
