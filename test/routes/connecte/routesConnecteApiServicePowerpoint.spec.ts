import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';

const { LECTURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/:id/powerpoint/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête GET sur `/api/service/:id/powerpoint/supportCommissionHomologation.pptx`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          '/api/service/456/powerpoint/supportCommissionHomologation.pptx'
        );
    });
  });
});
