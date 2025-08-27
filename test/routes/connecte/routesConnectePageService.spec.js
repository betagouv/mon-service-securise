import axios from 'axios';
import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { unService } from '../../constructeurs/constructeurService.js';
import {
  verifieTypeFichierServiEstCSV,
  verifieNomFichierServi,
} from '../../aides/verifieFichierServi.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { donneesPartagees } from '../../aides/http.js';
import Risque from '../../../src/modeles/risque.js';

describe('Le serveur MSS des routes /service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  [
    '/creation',
    '/ID-SERVICE',
    '/ID-SERVICE/descriptionService',
    '/ID-SERVICE/mesures',
    '/ID-SERVICE/indiceCyber',
    '/ID-SERVICE/rolesResponsabilites',
    '/ID-SERVICE/risques',
    '/ID-SERVICE/dossiers',
  ].forEach((route) => {
    describe(`quand GET sur /service${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
        testeur.referentiel().recharge({
          etapesParcoursHomologation: [
            { numero: 1, id: 'dateTelechargement' },
            { numero: 2, id: 'deuxieme', reserveePeutHomologuer: true },
          ],
        });
      });

      it("vérifie que l'utilisateur a accepté les CGU", (done) => {
        testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(
            `http://localhost:1234/service${route}`,
            done
          );
      });

      it("vérifie que l'état de la visite guidée est chargé sur la route", (done) => {
        testeur
          .middleware()
          .verifieRequeteChargeEtatVisiteGuidee(
            `http://localhost:1234/service${route}`,
            done
          );
      });

      it('sert le contenu HTML de la page', (done) => {
        axios
          .get(`http://localhost:1234/service${route}`)
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.headers['content-type']).to.contain('text/html');
            done();
          })
          .catch(done);
      });
    });
  });

  describe('quand requête GET sur `/service/creation `', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur
        .referentiel()
        .recharge({ actionsSaisie: { descriptionService: { position: 0 } } });
      testeur.depotDonnees().utilisateur = async (idUtilisateur) => ({
        id: idUtilisateur,
        entite: {
          nom: 'une entité',
        },
      });
    });

    it("Récupère dans le dépôt le nom de l'organisation de l'utilisateur", async () => {
      let idRecu;

      testeur.depotDonnees().utilisateur = async (idUtilisateur) => {
        idRecu = idUtilisateur;
        return { id: idUtilisateur, entite: { nom: 'une entité' } };
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
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation().construis(),
      });
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
        etapesParcoursHomologation: [{ numero: 1 }],
      });
    });

    it("aseptise l'identifiant reçu", (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['id'],
          'http://localhost:1234/service/456',
          done
        );
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService([], 'http://localhost:1234/service/456', done);
    });

    it("utilise le middleware de chargement de l'autorisation", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456',
          done
        );
    });

    describe('sur redirection vers une rubrique du service', () => {
      const casDeTests = [
        {
          droits: { [DECRIRE]: LECTURE },
          redirectionAttendue: '/descriptionService',
        },
        {
          droits: { [SECURISER]: LECTURE },
          redirectionAttendue: '/mesures',
        },
        {
          droits: { [HOMOLOGUER]: LECTURE },
          redirectionAttendue: '/dossiers',
        },
        {
          droits: { [RISQUES]: LECTURE },
          redirectionAttendue: '/risques',
        },
        {
          droits: { [CONTACTS]: LECTURE },
          redirectionAttendue: '/rolesResponsabilites',
        },
        {
          droits: {},
          redirectionAttendue: '/tableauDeBord',
        },
      ];

      casDeTests.forEach(({ droits, redirectionAttendue }) => {
        it(`redirige vers \`${redirectionAttendue}\` avec le droit de lecture sur \`${
          Object.keys(droits)[0] ?? 'aucune rubrique'
        }\``, async () => {
          const service = unService().construis();
          service.indiceCyber = () => ({ total: 2 });
          testeur.middleware().reinitialise({
            autorisationACharger: uneAutorisation()
              .avecDroits(droits)
              .construis(),
            serviceARenvoyer: service,
          });

          const reponse = await axios('http://localhost:1234/service/456');

          expect(reponse.request.res.responseUrl).to.contain(
            redirectionAttendue
          );
        });
      });

      it("redirige vers la suggestion d'action si les droits sont suffisants", async () => {
        const etape3SiDecrireEnEcriture = {
          lien: '/descriptionService?etape=3',
          permissionRequise: { rubrique: DECRIRE, niveau: ECRITURE },
        };

        testeur.referentiel().recharge({
          naturesSuggestionsActions: {
            revoirNiveauSecurite: etape3SiDecrireEnEcriture,
          },
        });
        testeur.middleware().reinitialise({
          autorisationACharger: uneAutorisation()
            .avecDroits({ DECRIRE: ECRITURE })
            .construis(),
          serviceARenvoyer: unService(testeur.referentiel())
            .avecId('456')
            .avecSuggestionAction({ nature: 'revoirNiveauSecurite' })
            .construis(),
        });

        const reponse = await axios('http://localhost:1234/service/456');

        expect(reponse.request.res.responseUrl).to.contain(
          '/service/456/descriptionService?etape=3'
        );
      });
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
      const service = unService().avecNomService('un service').construis();
      service.indiceCyber = () => ({ total: 2 });
      testeur.middleware().reinitialise({ serviceARenvoyer: service });
      testeur.referentiel().recharge({
        autorisationACharger: uneAutorisation().construis(),
      });
    });

    it('positionne un `nonce` dans les headers', (done) => {
      testeur
        .middleware()
        .verifieRequetePositionneNonce(
          'http://localhost:1234/service/456/mesures',
          done
        );
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
        const { nomService } = requete.service.descriptionService;
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

  describe('quand requête GET sur `/service/:id/mesures/export.csv', () => {
    beforeEach(() => {
      testeur.adaptateurCsv().genereCsvMesures = async () => Buffer.from('');
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: LECTURE, rubrique: SECURISER }],
        {
          method: 'GET',
          url: 'http://localhost:1234/service/456/mesures/export.csv',
        },
        done
      );
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id', 'avecDonneesAdditionnelles'],
        {
          method: 'GET',
          url: 'http://localhost:1234/service/456/mesures/export.csv',
        },
        done
      );
    });

    it('utilise un adaptateur CSV pour la génération', async () => {
      let mesuresExportees;
      testeur.adaptateurCsv().genereCsvMesures = async (mesures) => {
        mesuresExportees = mesures;
      };

      await axios.get('http://localhost:1234/service/456/mesures/export.csv');

      expect(mesuresExportees).to.eql({
        mesuresGenerales: [],
        mesuresSpecifiques: [],
      });
    });

    it("passe à l'adaptateur les prenomNom des contributeurs du service", async () => {
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService()
          .avecId('456')
          .ajouteUnContributeur(
            unUtilisateur().avecId('123').avecEmail('email.createur@mail.fr')
              .donnees
          )
          .ajouteUnContributeur(
            unUtilisateur()
              .avecId('145')
              .avecEmail('email.jeandupont@mail.fr')
              .quiSAppelle('Jean Dupont').donnees
          )
          .construis(),
      });
      let contributeursRenseignes;
      testeur.adaptateurCsv().genereCsvMesures = async (
        _mesures,
        contributeurs
      ) => {
        contributeursRenseignes = contributeurs;
      };

      await axios.get('http://localhost:1234/service/456/mesures/export.csv');

      expect(contributeursRenseignes).to.eql({
        123: 'email.createur@mail.fr',
        145: 'Jean Dupont',
      });
    });

    it('sert un fichier de type CSV', (done) => {
      verifieTypeFichierServiEstCSV(
        'http://localhost:1234/service/456/mesures/export.csv',
        done
      );
    });

    it('nomme le fichier CSV avec le nom du service et un horodatage', (done) => {
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService().avecNomService('Mairie').construis(),
      });
      testeur.adaptateurHorloge().maintenant = () => new Date(2024, 0, 23);
      verifieNomFichierServi(
        'http://localhost:1234/service/456/mesures/export.csv',
        'Mairie Liste mesures sans données additionnelles 20240123.csv',
        done
      );
    });

    it('tronque le nom du service à 30 caractères', async () => {
      const tropLong = new Array(150).fill('A').join('');
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService().avecNomService(tropLong).construis(),
      });
      testeur.adaptateurHorloge().maintenant = () => new Date(2024, 0, 23);

      const reponse = await axios(
        'http://localhost:1234/service/456/mesures/export.csv'
      );

      expect(reponse.headers['content-disposition']).to.contain(
        'filename="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Liste'
      );
    });

    it('décode correctement les caractères spéciaux dans le nom du service', (done) => {
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService()
          .avecNomService('Service d&#x27;apostrophe')
          .construis(),
      });
      testeur.adaptateurHorloge().maintenant = () => new Date(2024, 0, 23);

      verifieNomFichierServi(
        'http://localhost:1234/service/456/mesures/export.csv',
        'Service dapostrophe Liste mesures sans données additionnelles 20240123.csv',
        done
      );
    });

    it("reste robuste en cas d'erreur de génération CSV", async () => {
      testeur.adaptateurCsv().genereCsvMesures = async () => {
        throw Error('BOOM');
      };

      let executionOK;
      try {
        await axios.get('http://localhost:1234/service/456/mesures/export.csv');
        executionOK = true;
      } catch (e) {
        expect(e.response.status).to.be(424);
      } finally {
        if (executionOK) expect().fail('Une exception aurait dû être levée');
      }
    });

    it("logue l'erreur survenue le cas échéant", async () => {
      let erreurLoguee;

      testeur.adaptateurCsv().genereCsvMesures = async () => {
        throw Error('BOOM');
      };
      testeur.adaptateurGestionErreur().logueErreur = (erreur) => {
        erreurLoguee = erreur;
      };

      try {
        await axios.get('http://localhost:1234/service/456/mesures/export.csv');
      } catch (e) {
        expect(erreurLoguee).to.be.an(Error);
      }
    });
  });

  describe('quand requête GET sur `/service/:id/indiceCyber`', () => {
    beforeEach(() => {
      const service = unService().construis();
      service.indiceCyber = () => ({ total: 2 });
      testeur.middleware().reinitialise({ serviceARenvoyer: service });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          'http://localhost:1234/service/456/indiceCyber',
          done
        );
    });

    it("charge les autorisations du service pour l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/service/456/indiceCyber',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/service/456/indiceCyber',
          done
        );
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

    it('merge les données du référentiel et du service pour les risques généraux', async () => {
      const serviceARenvoyer = unService()
        .avecId('456')
        .avecNomService('un service')
        .construis();
      testeur.referentiel().recharge({
        risques: {
          logicielsMalveillants: {
            categories: ['integrite'],
            identifiantNumerique: 'R6',
            description: "Détournement de l'usage du service numérique",
          },
        },
        categoriesRisques: {
          integrite: 'Intégrité',
        },
      });
      testeur.middleware().reinitialise({ serviceARenvoyer });

      const reponse = await axios.get(
        'http://localhost:1234/service/456/risques'
      );

      const { risquesGeneraux } = donneesPartagees(
        reponse.data,
        'donnees-risques'
      );
      expect(risquesGeneraux.length).to.be(1);
      expect(risquesGeneraux[0]).to.eql({
        id: 'logicielsMalveillants',
        categories: ['integrite'],
        identifiantNumerique: 'R6',
        intitule: "Détournement de l'usage du service numérique",
        niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
      });
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
    let serviceARenvoyer;

    beforeEach(() => {
      serviceARenvoyer = unService()
        .avecId('456')
        .avecNomService('un service')
        .construis();
      serviceARenvoyer.dossierCourant = () => ({
        etapeCourante: () => 'dateTelechargement',
        dateTelechargement: { date: new Date() },
      });
      testeur.referentiel().recharge({
        etapesParcoursHomologation: [
          { numero: 1, id: 'dateTelechargement' },
          { numero: 2, id: 'deuxieme', reserveePeutHomologuer: true },
        ],
      });
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = async () => {};
      testeur.depotDonnees().service = async () => serviceARenvoyer;
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

    it("répond avec une erreur HTTP 404 si l'identifiant d'étape n'est pas connu du référentiel", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(404, 'Étape inconnue', {
        method: 'get',
        url: 'http://localhost:1234/service/456/homologation/edition/etape/inconnue',
      });
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
      testeur.depotDonnees().service = async () => {
        chargementsService += 1;
        return serviceARenvoyer;
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

    it("redirige vers la dernière étape disponible si l'étape demandée n'est pas accessible pour l'utilisateur", async () => {
      serviceARenvoyer = unService().construis();
      serviceARenvoyer.dossierCourant = () => ({
        etapeCourante: () => 'deuxieme',
        dateTelechargement: { date: new Date() },
      });
      testeur.depotDonnees().service = async () => serviceARenvoyer;
      testeur.depotDonnees().autorisationACharger = uneAutorisation()
        .deContributeur()
        .construis();

      const reponse = await axios(
        'http://localhost:1234/service/456/homologation/edition/etape/deuxieme'
      );

      expect(reponse.request.res.responseUrl).to.contain(
        'edition/etape/dateTelechargement'
      );
    });
  });
});
