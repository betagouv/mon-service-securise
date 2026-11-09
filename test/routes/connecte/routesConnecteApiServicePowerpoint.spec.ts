import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { VersionService } from '../../../src/modeles/versionService.js';

const { LECTURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/:id/pptx/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête GET sur `/api/service/:id/pptx/supportCommissionHomologation.pptx`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          '/api/service/456/pptx/supportCommissionHomologation.pptx'
        );
    });

    it('répond 404 si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecSupportCommissionPptx: () => false,
      });

      const reponse = await testeur.get(
        '/api/service/456/pptx/supportCommissionHomologation.pptx'
      );

      expect(reponse.status).toBe(404);
    });

    it('ne bloque pas les autres routes du service si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecSupportCommissionPptx: () => false,
      });

      const reponse = await testeur.get('/api/service/456/indiceCyber');

      expect(reponse.status).toBe(200);
    });

    it('répond 422 si le service est en V1', async () => {
      // @ts-expect-error on ne recharge que le nécessaire
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService()
          .avecVersion(VersionService.v1)
          .construis(),
      });

      const reponse = await testeur.get(
        '/api/service/456/pptx/supportCommissionHomologation.pptx'
      );

      expect(reponse.status).toBe(422);
      expect(reponse.body).toEqual({
        erreur: { code: 'SERVICE_V1_NON_SUPPORTE' },
      });
    });
  });
});
