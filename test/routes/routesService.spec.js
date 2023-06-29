const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./testeurMSS');
const Homologation = require('../../src/modeles/homologation');
const { unService } = require('../constructeurs/constructeurService');

describe('Le serveur MSS des routes /service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/service/creation `', () => {
    it("Récupère dans le dépôt le nom de l'organisation de l'utilisateur", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      let depotDonneesUtilisateursAppelle = false;

      testeur.depotDonnees().utilisateur = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        depotDonneesUtilisateursAppelle = true;
        return Promise.resolve({
          id: idUtilisateur,
          nomEntitePublique: 'une entité',
        });
      };

      axios('http://localhost:1234/service/creation')
        .then(() => expect(depotDonneesUtilisateursAppelle).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête GET sur `/service/:id`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.referentiel().recharge({
        statutsHomologation: {
          unStatut: { libelle: "Un statut d'homologation" },
        },
        etapesParcoursHomologation: [{ numero: 1 }],
      });
      const service = unService(testeur.referentiel())
        .avecId('456')
        .construis();
      service.dossiers.statutHomologation = () => 'unStatut';
      testeur.middleware().reinitialise({ homologationARenvoyer: service });
      testeur
        .middleware()
        .verifieRechercheService('http://localhost:1234/service/456', done);
    });
  });

  describe('quand requête GET sur `/service/:id/descriptionService`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/descriptionService',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/decision`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/decision',
          done
        );
    });

    it('sert la page avec un nonce', (done) => {
      testeur
        .middleware()
        .verifieRequetePositionneHeadersAvecNonce(
          'http://localhost:1234/service/456/decision',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/mesures`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/mesures',
          done
        );
    });

    it('interroge le moteur de règles pour obtenir les mesures personnalisées', (done) => {
      let moteurInterroge = false;
      const requete = {};

      testeur.middleware().trouveService(requete, undefined, () => {
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
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/rolesResponsabilites',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/risques`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/risques',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/avisExpertCyber`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/avisExpertCyber',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/dossiers`', () => {
    beforeEach(() => {
      testeur.referentiel().premiereEtapeParcours = () =>
        Promise.resolve({ id: 1 });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/dossiers',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/homologation/edition/etape/:idEtape`', () => {
    const homologationARenvoyer = new Homologation({
      id: '456',
      descriptionService: { nomService: 'un service' },
    });
    homologationARenvoyer.dossierCourant = () => ({
      etapeCourante: () => 'dateTelechargement',
      dateTelechargement: { date: new Date() },
    });

    beforeEach(() => {
      testeur.referentiel().recharge({
        etapesParcoursHomologation: [
          { numero: 1, id: 'dateTelechargement' },
          { numero: 2, id: 'deuxieme' },
        ],
      });
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = () =>
        Promise.resolve();
      testeur.depotDonnees().homologation = () =>
        Promise.resolve(homologationARenvoyer);
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement',
          done
        );
    });

    it("répond avec une erreur HTTP 404 si l'identifiant d'étape n'est pas connu du référentiel", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        404,
        'Étape inconnue',
        {
          method: 'get',
          url: 'http://localhost:1234/service/456/homologation/edition/etape/inconnue',
        },
        done
      );
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

      axios(
        'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement'
      )
        .then(() => expect(dossierAjoute).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it('recharge le service avant de servir la vue', (done) => {
      let chargementsService = 0;
      testeur.depotDonnees().homologation = () => {
        try {
          chargementsService += 1;
          return Promise.resolve(homologationARenvoyer);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios(
        'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement'
      )
        .then(() => expect(chargementsService).to.equal(1))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("redirige vers l'étape en cours si l'étape demandée est postérieure", (done) => {
      axios(
        'http://localhost:1234/service/456/homologation/edition/etape/deuxieme'
      )
        .then((reponse) => {
          expect(reponse.request.res.responseUrl).to.contain(
            'edition/etape/dateTelechargement'
          );
        })
        .then(() => done())
        .catch((e) => {
          done(e.response?.data || e);
        });
    });
  });
});
