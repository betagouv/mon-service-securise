import testeurMSS from '../testeurMSS.js';
import { ErreurNomServiceDejaExistant } from '../../../src/erreurs.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { UUID } from '../../../src/typesBasiques.js';
import DescriptionService from '../../../src/modeles/descriptionService.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { ECRITURE } = Permissions;
const { DECRIRE } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
    nomService: 'Service de test',
    nombreOrganisationsUtilisatrices: { borneBasse: '2', borneHaute: '2' },
    typeService: ['siteInternet'],
    provenanceService: 'developpement',
    statutDeploiement: 'enLigne',
    presentation: 'une présentation',
    fonctionnalites: ['newsletter'],
    donneesCaracterePersonnel: ['identite'],
    localisationDonnees: 'france',
    delaiAvantImpactCritique: 'plusUneJournee',
    niveauSecurite: 'niveau3',
    pointsAcces: [{ description: "un point d'accès" }],
    fonctionnalitesSpecifiques: [
      { description: 'une fonctionnalité spécifique' },
    ],
    donneesSensiblesSpecifiques: [
      { description: 'une donnée sensible spécifique' },
    ],
    organisationResponsable: { siret: '93939105800012' },
    ...cleValeur,
  });

  describe('quand requête PUT sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {};
      testeur.referentiel().recharge({
        statutsDeploiement: { enLigne: {} },
        localisationsDonnees: { france: {} },
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: DECRIRE }],
          testeur.app(),
          { method: 'put', url: '/api/service/456' }
        );
    });

    it("jette une erreur si l'ID est invalide", async () => {
      const { status } = await testeur.put(
        '/api/service/pasUnUUID',
        unePayloadValideSauf()
      );

      expect(status).toEqual(400);
    });

    describe('jette une erreur 400 si...', () => {
      it.each([
        { nomService: undefined },
        { organisationResponsable: undefined },
        { nombreOrganisationsUtilisatrices: undefined },
        { pointsAcces: undefined },
        { fonctionnalitesSpecifiques: undefined },
        { donneesSensiblesSpecifiques: undefined },
        { typeService: undefined },
        { provenanceService: undefined },
        { statutDeploiement: undefined },
        { presentation: undefined },
        { fonctionnalites: undefined },
        { donneesCaracterePersonnel: undefined },
        { localisationDonnees: undefined },
        { delaiAvantImpactCritique: undefined },
        { niveauSecurite: undefined },
      ])('la payload contient %s', async (donneesDuTest) => {
        const { status } = await testeur.put(
          `/api/service/${unUUIDRandom()}`,
          unePayloadValideSauf(donneesDuTest)
        );

        expect(status).toEqual(400);
      });
    });

    it('demande au dépôt de données de mettre à jour le service', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      let donneesRecues;
      testeur.depotDonnees().ajouteDescriptionService = async (
        idUtilisateur: UUID,
        idService: UUID,
        infosGenerales: DescriptionService
      ) => {
        donneesRecues = { idUtilisateur, idService, infosGenerales };
      };

      const idService = unUUIDRandom();
      const reponse = await testeur.put(
        `/api/service/${idService}`,
        unePayloadValideSauf()
      );

      expect(reponse.status).toEqual(200);
      expect(reponse.body).toEqual({ idService: '456' });
      expect(donneesRecues!.idUtilisateur).toEqual('123');
      expect(donneesRecues!.idService).toEqual(idService);
      expect(donneesRecues!.infosGenerales.nomService).toEqual(
        'Service de test'
      );
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', async () => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {
        throw new ErreurNomServiceDejaExistant('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } },
        {
          method: 'put',
          url: `/api/service/${unUUIDRandom()}`,
          data: unePayloadValideSauf({ nomService: 'nom existant' }),
        }
      );
    });
  });

  describe('quand requête POST sur `/api/service/estimationNiveauSecurite`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/service/estimationNiveauSecurite',
        });
    });

    it('aseptise les paramètres', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'nomService',
            'organisationsResponsables.*',
            'nombreOrganisationsUtilisatrices.*',
          ],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/estimationNiveauSecurite',
          }
        );
    });

    it('aseptise les listes de paramètres ainsi que leur contenu', async () => {
      await testeur.post('/api/service/estimationNiveauSecurite');

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it("retourne l'estimation du niveau de sécurité pour la description donnée", async () => {
      const donneesDescriptionNiveau1 = { nomService: 'Mon service' };
      const resultat = await testeur.post(
        '/api/service/estimationNiveauSecurite',
        donneesDescriptionNiveau1
      );

      expect(resultat.status).toBe(200);
      expect(resultat.body.niveauDeSecuriteMinimal).toBe('niveau1');
    });

    it('retourne une erreur HTTP 400 si les données de description de service sont invalides', async () => {
      const donneesInvalides = { statutDeploiement: 'statutInvalide' };
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'La description du service est invalide',
        {
          method: 'post',
          url: '/api/service/estimationNiveauSecurite',
          data: donneesInvalides,
        }
      );
    });
  });
});
