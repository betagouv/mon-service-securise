import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';

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
  });
});
