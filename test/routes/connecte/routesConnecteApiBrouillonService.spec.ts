import testeurMSS from '../testeurMSS.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.js';
import { UUID } from '../../../src/typesBasiques.js';

describe('Le serveur MSS des routes /api/brouillon-service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête POST sur `/api/brouillon-service`', () => {
    it('crée un brouillon de service et retourne son id', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().nouveauBrouillonService = async () => unUUID('3');

      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: 'Le service',
      });

      expect(resultat.body.id).toBe(unUUID('3'));
    });

    it('retourne une erreur 400 si le nom de service est vide', async () => {
      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: ' ',
      });

      expect(resultat.status).toBe(400);
    });
  });

  describe('quand requête POST sur `/api/brouillon-service/:id/finalise`', () => {
    it('délègue la finalisation du brouillon au dépôt de données', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: unUUID('1') });
      const idBrouillonTest = unUUIDRandom();
      testeur.depotDonnees().finaliseBrouillonService = async (
        idUtilisateur: UUID,
        idBrouillon: UUID
      ) => {
        expect(idUtilisateur).toBe(unUUID('1'));
        expect(idBrouillon).toBe(idBrouillonTest);

        return unUUID('3');
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${idBrouillonTest}/finalise`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body.idService).toBe(unUUID('3'));
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const resultat = await testeur.post(
        '/api/brouillon-service/pas-un-uuid/finalise'
      );

      expect(resultat.status).toBe(400);
    });
  });
});
