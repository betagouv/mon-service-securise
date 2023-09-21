const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('../testeurMSS');
const Homologation = require('../../../src/modeles/homologation');
const {
  Permissions: { LECTURE },
  Rubriques: { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES },
} = require('../../../src/modeles/autorisations/gestionDroits');

describe('Le serveur MSS des routes /service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/service/creation `', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur
        .referentiel()
        .recharge({ actionsSaisie: { descriptionService: { position: 0 } } });
      testeur.depotDonnees().utilisateur = async (idUtilisateur) => ({
        id: idUtilisateur,
        nomEntitePublique: 'une entité',
      });
    });

    it("Récupère dans le dépôt le nom de l'organisation de l'utilisateur", async () => {
      let idRecu;

      testeur.depotDonnees().utilisateur = async (idUtilisateur) => {
        idRecu = idUtilisateur;
        return { id: idUtilisateur, nomEntitePublique: 'une entité' };
      };

      await axios('http://localhost:1234/service/creation');
      expect(idRecu).to.equal('123');
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/service/creation',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
        etapesParcoursHomologation: [{ numero: 1 }],
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: DECRIRE }],
          'http://localhost:1234/service/456',
          done
        );
    });

    it('redirige vers la page de description du service', async () => {
      const reponse = await axios('http://localhost:1234/service/456');

      expect(reponse.request.res.responseUrl).to.contain(
        '/service/456/descriptionService'
      );
    });
  });

  describe('quand requête GET sur `/service/:id/descriptionService`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: DECRIRE }],
          'http://localhost:1234/service/456/descriptionService',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/descriptionService',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/service/456/descriptionService',
          done
        );
    });
  });

  describe('quand requête GET sur `/service/:id/mesures`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        statutsHomologation: {},
        etapesParcoursHomologation: [{ numero: 1 }],
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          'http://localhost:1234/service/456/mesures',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/mesures',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/service/456/mesures',
          done
        );
    });

    it('interroge le moteur de règles pour obtenir les mesures personnalisées', async () => {
      let descriptionRecue;
      const requete = {};

      testeur.middleware().trouveService(requete, undefined, () => {
        const { nomService } = requete.homologation.descriptionService;
        expect(nomService).to.equal('un service'); // sanity check
      });

      testeur.moteurRegles().mesures = (descriptionService) => {
        descriptionRecue = descriptionService;
        return {};
      };

      await axios('http://localhost:1234/service/456/mesures');

      expect(descriptionRecue.nomService).to.equal('un service');
    });
  });

  describe('quand requete GET sur `/service/:id/rolesResponsabilites`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: CONTACTS }],
          'http://localhost:1234/service/456/rolesResponsabilites',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/rolesResponsabilites',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
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
          [{ niveau: LECTURE, rubrique: RISQUES }],
          'http://localhost:1234/service/456/risques',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/risques',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/service/456/risques',
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
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          'http://localhost:1234/service/456/dossiers',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/dossiers',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
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
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = async () => {};
      testeur.depotDonnees().homologation = async () => homologationARenvoyer;
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
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

    it('ajoute un dossier courant au service si nécessaire', async () => {
      let idRecu;
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = async (
        idService
      ) => {
        idRecu = idService;
      };

      await axios(
        'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement'
      );

      expect(idRecu).to.be('456');
    });

    it('recharge le service avant de servir la vue', async () => {
      let chargementsService = 0;
      testeur.depotDonnees().homologation = async () => {
        chargementsService += 1;
        return homologationARenvoyer;
      };

      await axios(
        'http://localhost:1234/service/456/homologation/edition/etape/dateTelechargement'
      );

      expect(chargementsService).to.equal(1);
    });

    it("redirige vers l'étape en cours si l'étape demandée est postérieure", async () => {
      const reponse = await axios(
        'http://localhost:1234/service/456/homologation/edition/etape/deuxieme'
      );

      expect(reponse.request.res.responseUrl).to.contain(
        'edition/etape/dateTelechargement'
      );
    });
  });
});
