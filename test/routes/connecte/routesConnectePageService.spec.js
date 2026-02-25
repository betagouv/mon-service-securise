import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
} from '../../aides/verifieFichierServi.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { donneesPartagees } from '../../aides/http.js';
import Risque from '../../../src/modeles/risque.js';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';

const { LECTURE, ECRITURE } = Permissions;
const { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES } = Rubriques;

describe('Le serveur MSS des routes /service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  [
    '/ID-SERVICE/descriptionService',
    '/ID-SERVICE/mesures',
    '/ID-SERVICE/indiceCyber',
    '/ID-SERVICE/rolesResponsabilites',
    '/ID-SERVICE/risques',
    '/ID-SERVICE/risques/v2',
    '/ID-SERVICE/dossiers',
    '/ID-SERVICE/simulation-referentiel-v2',
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
        testeur.depotDonnees().ajouteSimulationMigrationReferentielSiNecessaire =
          async () => {};
      });

      it("vérifie que l'utilisateur a accepté les CGU", async () => {
        await testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(testeur.app(), `/service${route}`);
      });

      it("vérifie que l'état de la visite guidée est chargé sur la route", async () => {
        await testeur
          .middleware()
          .verifieRequeteChargeEtatVisiteGuidee(
            testeur.app(),
            `/service${route}`
          );
      });

      it('sert le contenu HTML de la page', async () => {
        const reponse = await testeur.get(`/service${route}`);

        expect(reponse.status).to.equal(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
      });
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

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), `/service/456`);
    });

    it("vérifie que l'état de la visite guidée est chargé sur la route", async () => {
      await testeur
        .middleware()
        .verifieRequeteChargeEtatVisiteGuidee(testeur.app(), `/service/456`);
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService([], testeur.app(), '/service/456');
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), '/service/456');
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
          const service = unService()
            .avecDescription(uneDescriptionValide().deLOrganisation({}).donnees)
            .construis();
          service.indiceCyber = () => ({ total: 2 });
          testeur.middleware().reinitialise({
            autorisationACharger: uneAutorisation()
              .avecDroits(droits)
              .construis(),
            serviceARenvoyer: service,
          });

          const reponse = await testeur.get('/service/456');

          expect(reponse.headers.location).to.contain(redirectionAttendue);
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

        const reponse = await testeur.get('/service/456');

        expect(reponse.headers.location).to.contain(
          '/service/456/descriptionService?etape=3'
        );
      });
    });
  });

  describe('quand requête GET sur `/service/:id/descriptionService`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: DECRIRE }],
          testeur.app(),
          '/service/456/descriptionService'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/descriptionService'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(
          testeur.app(),
          '/service/456/descriptionService'
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

    it('positionne un `nonce` dans les headers', async () => {
      await testeur
        .middleware()
        .verifieRequetePositionneNonce(testeur.app(), '/service/456/mesures');
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          '/service/456/mesures'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/mesures'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(testeur.app(), '/service/456/mesures');
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

      await testeur.get('/service/456/mesures');

      expect(descriptionRecue.nomService).to.equal('un service');
    });
  });

  describe('quand requête GET sur `/service/:id/mesures/export.csv', () => {
    beforeEach(() => {
      testeur.adaptateurCsv().genereCsvMesures = async () => Buffer.from('');
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'GET',
            url: '/service/456/mesures/export.csv',
          }
        );
    });

    it('jette une erreur si le paramètres `avecDonneesAdditionnelles` est invalide', async () => {
      const reponse = await testeur.get(
        '/service/456/mesures/export.csv?avecDonneesAdditionnelles=pasUnBooleen'
      );

      expect(reponse.status).to.eql(400);
    });

    it('autorise le paramètre `timestamp`', async () => {
      const reponse = await testeur.get(
        '/service/456/mesures/export.csv?avecDonneesAdditionnelles=true&timestamp=12345'
      );

      expect(reponse.status).to.eql(200);
    });

    it('utilise un adaptateur CSV pour la génération', async () => {
      let mesuresExportees;
      testeur.adaptateurCsv().genereCsvMesures = async (mesures) => {
        mesuresExportees = mesures;
      };

      await testeur.get('/service/456/mesures/export.csv');

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

      await testeur.get('/service/456/mesures/export.csv');

      expect(contributeursRenseignes).to.eql({
        123: 'email.createur@mail.fr',
        145: 'Jean Dupont',
      });
    });

    it('sert un fichier de type CSV', async () => {
      await verifieTypeFichierServiEstCSV(
        testeur.app(),
        '/service/456/mesures/export.csv'
      );
    });

    it('nomme le fichier CSV avec le nom du service et un horodatage', async () => {
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService().avecNomService('Mairie').construis(),
      });
      testeur.adaptateurHorloge().maintenant = () => new Date(2024, 0, 23);
      await verifieNomFichierServi(
        testeur.app(),
        '/service/456/mesures/export.csv',
        'Mairie Liste mesures sans données additionnelles 20240123.csv'
      );
    });

    it('tronque le nom du service à 30 caractères', async () => {
      const tropLong = new Array(150).fill('A').join('');
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService().avecNomService(tropLong).construis(),
      });
      testeur.adaptateurHorloge().maintenant = () => new Date(2024, 0, 23);

      const reponse = await testeur.get('/service/456/mesures/export.csv');

      expect(reponse.headers['content-disposition']).to.contain(
        'filename="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Liste'
      );
    });

    it("reste robuste en cas d'erreur de génération CSV", async () => {
      testeur.adaptateurCsv().genereCsvMesures = async () => {
        throw Error('BOOM');
      };

      const reponse = await testeur.get('/service/456/mesures/export.csv');
      expect(reponse.status).to.be(424);
    });

    it("logue l'erreur survenue le cas échéant", async () => {
      let erreurLoguee;

      testeur.adaptateurCsv().genereCsvMesures = async () => {
        throw Error('BOOM');
      };
      testeur.adaptateurGestionErreur().logueErreur = (erreur) => {
        erreurLoguee = erreur;
      };

      await testeur.get('/service/456/mesures/export.csv');
      expect(erreurLoguee).to.be.an(Error);
    });
  });

  describe('quand requête GET sur `/service/:id/indiceCyber`', () => {
    beforeEach(() => {
      const service = unService().construis();
      service.indiceCyber = () => ({ total: 2 });
      testeur.middleware().reinitialise({ serviceARenvoyer: service });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          '/service/456/indiceCyber'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/indiceCyber'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(
          testeur.app(),
          '/service/456/indiceCyber'
        );
    });
  });

  describe('quand requete GET sur `/service/:id/rolesResponsabilites`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: CONTACTS }],
          testeur.app(),
          '/service/456/rolesResponsabilites'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/rolesResponsabilites'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(
          testeur.app(),
          '/service/456/rolesResponsabilites'
        );
    });
  });

  describe('quand requête GET sur `/service/:id/risques`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: RISQUES }],
          testeur.app(),
          '/service/456/risques'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/risques'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(testeur.app(), '/service/456/risques');
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
        categoriesRisques: { integrite: 'Intégrité' },
      });
      testeur.middleware().reinitialise({ serviceARenvoyer });

      const reponse = await testeur.get('/service/456/risques');

      const { risquesGeneraux } = donneesPartagees(
        reponse.text,
        'donnees-risques'
      );
      expect(risquesGeneraux.length).to.be(1);
      expect(risquesGeneraux[0]).to.eql({
        id: 'logicielsMalveillants',
        categories: ['integrite'],
        identifiantNumerique: 'R6',
        intitule: 'Détournement de l&apos;usage du service numérique',
        niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
      });
    });
  });

  describe('quand requête GET sur `/service/:id/dossiers`', () => {
    beforeEach(() => {
      testeur.referentiel().premiereEtapeParcours = async () => ({ id: 1 });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          '/service/456/dossiers'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/dossiers'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(
          testeur.app(),
          '/service/456/dossiers'
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

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          '/service/456/homologation/edition/etape/dateTelechargement'
        );
    });

    it("charge les autorisations du service pour l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/service/456/homologation/edition/etape/dateTelechargement'
        );
    });

    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(
          testeur.app(),
          '/service/456/homologation/edition/etape/dateTelechargement'
        );
    });

    it("répond avec une erreur HTTP 404 si l'identifiant d'étape n'est pas connu du référentiel", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(404, 'Étape inconnue', {
        method: 'get',
        url: '/service/456/homologation/edition/etape/inconnue',
      });
    });

    it('ajoute un dossier courant au service si nécessaire', async () => {
      let idRecu;
      testeur.depotDonnees().ajouteDossierCourantSiNecessaire = async (
        idService
      ) => {
        idRecu = idService;
      };

      await testeur.get(
        '/service/456/homologation/edition/etape/dateTelechargement'
      );

      expect(idRecu).to.be('456');
    });

    it('recharge le service avant de servir la vue', async () => {
      let chargementsService = 0;
      testeur.depotDonnees().service = async () => {
        chargementsService += 1;
        return serviceARenvoyer;
      };

      await testeur.get(
        '/service/456/homologation/edition/etape/dateTelechargement'
      );

      expect(chargementsService).to.equal(1);
    });

    it("redirige vers l'étape en cours si l'étape demandée est postérieure", async () => {
      const reponse = await testeur.get(
        '/service/456/homologation/edition/etape/deuxieme'
      );

      expect(reponse.headers.location).to.contain('dateTelechargement');
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

      const reponse = await testeur.get(
        '/service/456/homologation/edition/etape/deuxieme'
      );

      expect(reponse.headers.location).to.contain('dateTelechargement');
    });
  });

  describe('sur demande de la page de création v2', () => {
    beforeEach(() => {
      testeur.depotDonnees().utilisateur = async () =>
        unUtilisateur()
          .quiTravaillePour({
            nom: 'Mon organisation',
            departement: '33',
            siret: '12345',
          })
          .construis();
    });
    it('répond 200', async () => {
      const reponse = await testeur.get('/service/v2/creation');

      expect(reponse.status).to.be(200);
    });

    it("ajoute l'entite de l'utilisateur aux données partagées", async () => {
      const reponse = await testeur.get('/service/v2/creation');

      expect(donneesPartagees(reponse.text, 'donnees-profil').entite).to.eql({
        siret: '12345',
        nom: 'Mon organisation',
        departement: '33',
      });
    });
  });

  describe('quand requête GET sur `/service/:id/simulation-referentiel-v2`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteSimulationMigrationReferentielSiNecessaire =
        async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService(
        [
          { niveau: ECRITURE, rubrique: DECRIRE },
          { niveau: ECRITURE, rubrique: SECURISER },
        ],
        testeur.app(),
        '/service/456/simulation-referentiel-v2'
      );
    });

    it("créé une simulation si elle n'existe pas", async () => {
      let serviceRecu;
      testeur.depotDonnees().ajouteSimulationMigrationReferentielSiNecessaire =
        async (service) => {
          serviceRecu = service;
        };

      await testeur.get('/service/456/simulation-referentiel-v2');
      expect(serviceRecu.id).to.be('456');
    });

    it("jette une erreur si le service n'est pas en V1", async () => {
      testeur.middleware().reinitialise({
        serviceARenvoyer: unServiceV2().construis(),
      });

      const reponse = await testeur.get(
        '/service/456/simulation-referentiel-v2'
      );
      expect(reponse.status).to.be(400);
    });
  });
});
