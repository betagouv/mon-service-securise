import testeurMSS from '../testeurMSS.js';
import { ErreurNomServiceDejaExistant } from '../../../src/erreurs.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { UUID } from '../../../src/typesBasiques.ts';
import DescriptionService from '../../../src/modeles/descriptionService.js';

const { ECRITURE } = Permissions;
const { DECRIRE } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête PUT sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {};
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
          { method: 'put', url: '/api/service/456' }
        );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", async () => {
      await testeur.put('/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', async () => {
      await testeur.put('/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', async () => {
      await testeur.put('/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it('demande au dépôt de données de mettre à jour le service', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().ajouteDescriptionService = async (
        idUtilisateur: UUID,
        idService: UUID,
        infosGenerales: DescriptionService
      ) => {
        expect(idUtilisateur).toEqual('123');
        expect(idService).toEqual('456');
        expect(infosGenerales.nomService).toEqual('Nouveau Nom');
      };

      const reponse = await testeur.put('/api/service/456', {
        nomService: 'Nouveau Nom',
      });

      expect(reponse.status).toEqual(200);
      expect(reponse.body).toEqual({ idService: '456' });
    });

    it('retourne une erreur HTTP 422 si le validateur du modèle échoue', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le statut de déploiement "statutInvalide" est invalide',
        {
          method: 'put',
          url: '/api/service/456',
          data: { statutDeploiement: 'statutInvalide' },
        }
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
          url: '/api/service/456',
          data: { nomService: 'service déjà existant' },
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
