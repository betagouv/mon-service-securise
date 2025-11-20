import { beforeEach } from 'vitest';
import testeurMSS from '../testeurMSS.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';
import { BrouillonService } from '../../../src/modeles/brouillonService.js';
import { ErreurSimulationInexistante } from '../../../src/erreurs.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';

const { LECTURE } = Permissions;
const { DECRIRE, SECURISER } = Rubriques;

describe('Le serveur MSS des routes /api/service/:id/simulation-migration-referentiel/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête GET sur `/api/service/:id/simulation-migration-referentiel`', () => {
    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService(
        [
          { niveau: LECTURE, rubrique: DECRIRE },
          { niveau: LECTURE, rubrique: SECURISER },
        ],
        testeur.app(),
        {
          method: 'get',
          url: `/api/service/${unUUIDRandom()}/simulation-migration-referentiel`,
        }
      );
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const reponse = await testeur.get(
        '/api/service/PAS_UN_UUID/simulation-migration-referentiel'
      );

      expect(reponse.status).toBe(400);
    });

    it('retourne la simulation pour le service correspondant', async () => {
      const idService = unUUIDRandom();

      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
        new BrouillonService(idService, { nomService: 'Une simulation' });

      const reponse = await testeur.get(
        `/api/service/${idService}/simulation-migration-referentiel`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        id: idService,
        nomService: 'Une simulation',
      });
    });

    it("renvoie une erreur 404 si la simulation n'existe pas", async () => {
      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () => {
        throw new ErreurSimulationInexistante();
      };

      const reponse = await testeur.get(
        `/api/service/${unUUIDRandom()}/simulation-migration-referentiel`
      );

      expect(reponse.status).toBe(404);
    });
  });
});
